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
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
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
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';

// Custom plugin
import FileUpload from './fileUpload';
import MathInput from './mathInput';
import BrokenLink from './brokenLink';
import Fullscreen from './fullscreen-plugin/FullScreen';
import LearningPathPreview from './learningPathPreview';
import ScreenRecord from './screenRecord';

// Inspector (REMOVE for Production)
// import CKEditorInspector from '@ckeditor/ckeditor5-inspector';

class ClassicEditor extends ClassicEditorBase { }
class InlineEditor extends InlineEditorBase { }

// Custom plugin
const customPlugins = [MathInput, BrokenLink, FileUpload, Fullscreen, LearningPathPreview, ScreenRecord];

// Plugins to include in the build.
const plugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold, Italic, Underline, Subscript, Superscript,
	BlockQuote,
	Font,
	CKFinder,
	EasyImage,
	Heading,
	Image, ImageCaption, ImageStyle, ImageToolbar, ImageResize, LinkImage,
	ImageUpload,
	Indent, IndentBlock,
	Link,
	List,
	Mention,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	Table, TableToolbar, TableProperties, TableCellProperties,
	TextTransformation,
	HorizontalLine
];
// Merge 2 plugins arrays
const builtinPlugins = plugins.concat(customPlugins);
ClassicEditor.builtinPlugins = builtinPlugins;
InlineEditor.builtinPlugins = builtinPlugins;

// Editor configuration.
const config = {
	toolbar: {
		items: [
			'heading', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'|', 'bold', 'italic', 'underline', 
			'|', 'subscript', 'superscript', 'link',
			'|', 'bulletedList', 'numberedList', 'horizontalLine', 'fullScreen',
			'|', 'indent', 'outdent',
			'|', 'blockQuote', 'insertTable', 'mediaEmbed', 'brokenLink',
			'|', 'imageUpload', 'mathInput', 'fileUpload', 'screenRecord',
			'|', 'undo', 'redo'
		],
	},
	image: {
		// Configure the available styles.
		styles: [
			'alignLeft', 'alignCenter', 'alignRight'
		],
		// Configure the available image resize options.
		resizeOptions: [
			{
				name: 'imageResize:original',
				label: 'Original',
				value: null
			},
			{
				name: 'imageResize:50',
				label: '50%',
				value: '50'
			},
			{
				name: 'imageResize:75',
				label: '75%',
				value: '75'
			}
		],
		// You need to configure the image toolbar, too, so it shows the new style buttons as well as the resize buttons.
		toolbar: [
			'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
			'|',
			'imageResize',
			'|',
			'imageTextAlternative',
			'|',
			'linkImage'
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
	link: {
		// Automatically add target="_blank" and rel="noopener noreferrer" to all external links.
		addTargetToExternalLinks: true,
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

ClassicEditor.defaultConfig = config;
InlineEditor.defaultConfig = config;

export default {
	ClassicEditor, 
	InlineEditor, 
	// CKEditorInspector
};

