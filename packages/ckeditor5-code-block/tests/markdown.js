/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import CodeBlockEditing from '../src/codeblockediting';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import GFMDataProcessor from '@ckeditor/ckeditor5-markdown-gfm/src/gfmdataprocessor';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

// A simple plugin that enables the GFM data processor.
class Markdown extends Plugin {
	constructor( editor ) {
		super( editor );
		editor.data.processor = new GFMDataProcessor( editor.data.viewDocument );
	}
}

function getEditor( initialData = '' ) {
	return ClassicTestEditor
		.create( initialData, {
			plugins: [ Markdown, CodeBlockEditing, Enter, Paragraph ]
		} );
}

describe( 'Markdown', () => {
	it( 'should be loaded and returned from the editor', () => {
		const markdown =
			'```\n' +
			'test()\n' +
			'```';

		return getEditor( markdown ).then( editor => {
			// This is to account to the new behavior of the markdown plugin after its code revamp.
			// This cleanup could be removed later on, once the revamp is merged.
			let data = editor.getData();
			data = data.replace( 'plaintext', '' );

			expect( data ).to.equal( markdown );

			editor.destroy(); // Tests cleanup.
		} );
	} );
} );