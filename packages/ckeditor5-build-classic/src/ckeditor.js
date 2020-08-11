/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';

// Import core plugins
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Font from '@ckeditor/ckeditor5-font/src/font';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
// Custom plugin
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import XmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/xmldataprocessor';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
// import specialcharicon from '@ckeditor/ckeditor5-special-characters/theme/icons/specialcharacters.svg';

// Inspector (REMOVE for Production)
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

class ClassicEditor extends ClassicEditorBase {}
class InlineEditor extends InlineEditorBase {}

// Custom plugin
class MathInput extends Plugin {
    init() {
		//destructure
		const editor = this.editor;
		const schema = editor.model.schema;
		//define var
		const svgTag = 'svg';
		const mathNs = 'mathlive';

		// Configure the schema.
		schema.register( mathNs, {
			allowWhere: '$text',
			isObject: true,
			isInline: true,
			allowAttributes: [ 'formula', 'latexcode', 'viewBox', 'width', 'height', 'style' ]
		} );

		// View -> Model
		editor.data.upcastDispatcher.on( 'element:' + svgTag, createMathModel);

		// Model -> Editing view
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: mathNs,
			view: createMathWidget
		} );

		// Model -> Data view
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: mathNs,
			view: createMathUIElement
		} );

		function createMathModel( evt, data, conversionApi ) {
			const { consumable, writer } = conversionApi;
			const viewItem = data.viewItem;

			// When element was already consumed then skip it.
			if ( !consumable.test( viewItem, { name: true } ) ) {
				return;
			}

			// Get the formula of the <svg> (which is all its children).
			const processor = new XmlDataProcessor();
			const upcastWriter = new UpcastWriter( editor.model.document );
			const documentFragment = upcastWriter.createDocumentFragment(viewItem.getChildren());
			const formula = processor.toData( documentFragment ) || '';

			// Get attributes of SVG element itself
			const latexcode = viewItem._attrs.get('latexcode');
			const viewBox = viewItem._attrs.get('viewBox');
			const width = viewItem._attrs.get('width');
			const height = viewItem._attrs.get('height');
			const style = viewItem._attrs.get('style') || '';

			// Create the <mathlive> model element.
			const modelElement = writer.createElement( mathNs, { formula, latexcode, viewBox, width, height, style } );

			// Find allowed parent for element that we are going to insert.
			// If current parent does not allow to insert element but one of the ancestors does
			// then split nodes to allowed parent.
			const splitResult = conversionApi.splitToAllowedParent( modelElement, data.modelCursor );

			// When there is no split result it means that we can't insert element to model tree, so let's skip it.
			if ( !splitResult ) {
				return;
			}

			// Insert element on allowed position.
			conversionApi.writer.insert( modelElement, splitResult.position );

			// Consume appropriate value from consumable values list.
			consumable.consume( viewItem, { name: true } );

			const parts = conversionApi.getSplitParts( modelElement );

			// Set conversion result range.
			data.modelRange = writer.createRange(
				conversionApi.writer.createPositionBefore( modelElement ),
				conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
			);

			// Now we need to check where the `modelCursor` should be.
			if ( splitResult.cursorParent ) {
				// If we split parent to insert our element then we want to continue conversion in the new part of the split parent.
				//
				// before: <allowed><notAllowed>foo[]</notAllowed></allowed>
				// after:  <allowed><notAllowed>foo</notAllowed><converted></converted><notAllowed>[]</notAllowed></allowed>

				data.modelCursor = conversionApi.writer.createPositionAt( splitResult.cursorParent, 0 );
			} else {
				// Otherwise just continue after inserted element.
				data.modelCursor = data.modelRange.end;
			}
		}

		function createMathWidget( modelItem, viewWriter ) {
			const widgetElement = viewWriter.createContainerElement( 'span', {
				class: 'ck-math-widget'
			} );

			const mathUIElement = createMathUIElement( modelItem, viewWriter );

			viewWriter.insert( viewWriter.createPositionAt( widgetElement, 0 ), mathUIElement );

			return toWidget( widgetElement, viewWriter );
		}

		function createMathUIElement( modelItem, viewWriter ) {
			return viewWriter.createUIElement( svgTag, {}, function( domDocument ) {
				const mathDOMElement = domDocument.createElementNS( 'http://www.w3.org/2000/svg', svgTag );

				mathDOMElement.setAttributeNS( 'http://www.w3.org/2000/xmlns/', 'xmlns', 'http://www.w3.org/2000/svg' );
				mathDOMElement.setAttributeNS( 'http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );
				mathDOMElement.setAttribute( 'latexcode', modelItem.getAttribute('latexcode') );
				mathDOMElement.setAttribute( 'viewBox', modelItem.getAttribute('viewBox') );
				mathDOMElement.setAttribute( 'width', modelItem.getAttribute('width') );
				mathDOMElement.setAttribute( 'height', modelItem.getAttribute('height') );
				mathDOMElement.setAttribute( 'style', modelItem.getAttribute('style') );

				mathDOMElement.innerHTML = modelItem.getAttribute( 'formula' );

				return mathDOMElement;
			} );
		}

		// add button UI
        editor.ui.componentFactory.add( 'mathInput', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Mathematical Input',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 2.5a7.47 7.47 0 0 1 4.231 1.31 7.268 7.268 0 0 1 2.703 3.454 7.128 7.128 0 0 1 .199 4.353c-.39 1.436-1.475 2.72-2.633 3.677h2.013c0-.226.092-.443.254-.603a.876.876 0 0 1 1.229 0c.163.16.254.377.254.603v.853c0 .209-.078.41-.22.567a.873.873 0 0 1-.547.28l-.101.006h-4.695a.517.517 0 0 1-.516-.518v-1.265c0-.21.128-.398.317-.489a5.601 5.601 0 0 0 2.492-2.371 5.459 5.459 0 0 0 .552-3.693 5.53 5.53 0 0 0-1.955-3.2A5.71 5.71 0 0 0 10 4.206 5.708 5.708 0 0 0 6.419 5.46 5.527 5.527 0 0 0 4.46 8.663a5.457 5.457 0 0 0 .554 3.695 5.6 5.6 0 0 0 2.497 2.37.55.55 0 0 1 .317.49v1.264c0 .286-.23.518-.516.518H2.618a.877.877 0 0 1-.614-.25.845.845 0 0 1-.254-.603v-.853c0-.226.091-.443.254-.603a.876.876 0 0 1 1.228 0c.163.16.255.377.255.603h1.925c-1.158-.958-2.155-2.241-2.545-3.678a7.128 7.128 0 0 1 .199-4.352 7.268 7.268 0 0 1 2.703-3.455A7.475 7.475 0 0 1 10 2.5z"/></svg>',
                tooltip: true
            } );

            // Callback on click button
            view.on( 'execute', () => {
				csl.ckEditorWidget.openMathInput(editor);
            } );

            return view;
        } );
    }
}
const customPlugins = [
	MathInput
];

// Plugins to include in the build.
const plugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold, Italic,Underline, Subscript, Superscript,
	BlockQuote,
	Font,
	CKFinder,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table, TableToolbar, TableProperties, TableCellProperties,
	TextTransformation  
];
// Merge 2 plugins arrays
const builtinPlugins = plugins.concat(customPlugins);
ClassicEditor.builtinPlugins = builtinPlugins;
InlineEditor.builtinPlugins = builtinPlugins;

// Editor configuration.
const config = {
	toolbar: {
		items: [
			'heading',
			'fontSize', 'fontColor', 'fontBackgroundColor',
			'|',
			'bold', 'italic', 'underline', 'subscript', 'superscript',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'indent',
			'outdent',
			'|',
			'imageUpload',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'mathInput',
			'undo',
			'redo'
		]
	},
	image: {
		toolbar: [
			'imageStyle:full',
			'imageStyle:side',
			'|',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties', 
			'tableCellProperties'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

ClassicEditor.defaultConfig = config;
InlineEditor.defaultConfig = config;

export default {
    ClassicEditor, InlineEditor, CKEditorInspector
};