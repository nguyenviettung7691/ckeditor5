import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

/**
 * This plugin handles generic file uploads and render them as links.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FileUpload extends Plugin {
    /**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository, Notification ];
    }
    
    static get pluginName() {
		return 'FileUpload';
    }

    /**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'file', {
			upload: {
                types: 'pdf,docx,xlsx,pptx,jpeg,jpg,gif,png,svg,mp3,ogg,mp4,m4v,ogv,html,zip',
				placeholderText: 'Uploading file...',
				errorText: 'Uploading file failed!'
			}
        } );
    }

    /**
	 * @inheritDoc
	 */
    init() {
		// Custom FileUpload button
        const editor = this.editor;
        const doc = editor.model.document;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const fileRepository = editor.plugins.get( FileRepository );

        // Setup schema to allow uploadId and uploadStatus for paragraph.
		schema.extend( 'paragraph', {
			allowAttributes: [ 'uploadId', 'uploadStatus' ]
        } );
        
        // Register upcast converter for uploadId.
		conversion.for( 'upcast' )
        .attributeToAttribute( {
            view: {
                name: 'p',
                key: 'uploadId'
            },
            model: 'uploadId'
        } );

        //TODO: // Handle pasted files. (refer to ImageUploadEditing)
        //TODO: // Handle HTML pasted with links to files. (refer to ImageUploadEditing)

        //bind event handler for button fileUpload
        editor.ui.componentFactory.add( 'fileUpload', locale => {
            const view = new FileDialogButtonView( locale );
            const fileTypes = editor.config.get( 'file.upload.types' ).split(',').map(function(type){ return '.' + type; });
            // fileTypes should be in format: '.pdf,.docx,.xlsx,.pptx,.jpeg,.jpg,.gif,.png,.svg,.mp3,.ogg,.mp4,.m4v,.ogv,.html,.zip'
            // Sanitize the MIME type name which may include: "+", "-" or ".".
			const regExpSafeNames = fileTypes.map( type => type.replace( '+', '\\+' ).replace('/', '\/') );
            const fileTypesRegExp = new RegExp( `^(${ regExpSafeNames.join( '|' ) })$` );

            view.set( {
                acceptedType: fileTypes.map( type => `${ type }` ).join( ',' ),
                allowMultipleFiles: false
            } );

            view.buttonView.set( {
                label: 'Insert file',
                icon: `<svg xmlns="http://www.w3.org/2000/svg" id="bold" enable-background="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512"><path d="m14.78 13.47-2.25-2.25c-.293-.293-.768-.293-1.061 0l-2.25 2.25c-.471.47-.138 1.28.53 1.28h1.251v3.25c0 .552.447 1 1 1s1-.448 1-1v-3.25h1.25c.669 0 1.002-.81.53-1.28z"/><path d="m15 23h-6c-1.103 0-2-.897-2-2v-1c0-.552.447-1 1-1s1 .448 1 1v1h6v-1c0-.552.447-1 1-1s1 .448 1 1v1c0 1.103-.897 2-2 2z"/><path d="m18.673 4.927c-1.312-2.399-3.884-3.927-6.673-3.927-3.545 0-6.62 2.465-7.397 5.829-2.584.272-4.603 2.442-4.603 5.071 0 2.812 2.312 5.1 5.152 5.1h3.848v-.353c-.797-.225-1.462-.802-1.791-1.594-.426-1.037-.19-2.212.598-3l2.249-2.248c1.039-1.039 2.85-1.039 3.889 0l2.25 2.25c.788.787 1.022 1.961.599 2.992-.33.796-.996 1.374-1.793 1.599v.354h2.87c3.38 0 6.13-2.722 6.13-6.067-.001-3.066-2.308-5.625-5.328-6.006z"/></svg>`,
                tooltip: true
            } );

            view.on( 'done', ( evt, files ) => {
                const filesToUpload = Array.from( files ).filter( file => fileTypesRegExp.test( this.getExt(file.name) ) );
                if ( filesToUpload.length ) {
                    const model = editor.model;
                    const fileRepository = editor.plugins.get( FileRepository );
                    model.change( writer => {
                        const filesToProcess = Array.isArray( filesToUpload ) ? filesToUpload : [ filesToUpload ];
                        for ( const fileToProcess of filesToProcess ) {
                            const loader = fileRepository.createLoader( fileToProcess );
                            // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
                            if ( !loader ) {
                                return;
                            }
							const placeholderElement = writer.createElement('paragraph', { uploadId: loader.id } );
							writer.insertText(editor.config.get( 'file.upload.placeholderText' ), placeholderElement);
                            const insertAtSelection = findOptimalInsertionPosition( model.document.selection, model );
                            // const insertAtSelection = model.document.selection;
                            model.insertContent( placeholderElement, insertAtSelection );
                        }
                    } );
                }
            } );

            return view;
		} );
		
		// Upload placeholder element that appeared in the model.
		doc.on( 'change', () => {
			const changes = doc.differ.getChanges( { includeChangesInGraveyard: true } );

			for ( const entry of changes ) {
				if ( entry.type == 'insert' && entry.name != '$text' ) {
					const item = entry.position.nodeAfter;
					const isInGraveyard = entry.position.root.rootName == '$graveyard';

					for ( const filteredItem of filterFromChangeItem( editor, item ) ) {
						// Check if the upload file still has upload id.
						const uploadId = filteredItem.getAttribute( 'uploadId' );
						
						if ( !uploadId ) {
							continue;
						}

						// Check if the file is loaded on this client.
						const loader = fileRepository.loaders.get( uploadId );

						if ( !loader ) {
							continue;
						}

						if ( isInGraveyard ) {
							// If the file was inserted to the graveyard - abort the loading process.
							loader.abort();
						} else if ( loader.status == 'idle' ) {
							// If the file was inserted into content and has not been loaded yet, start loading it.
							this._readAndUpload( loader, filteredItem );
						}
					}
				}
			}
		} );
    }
    
    /**
	 * Reads and uploads a file.
	 *
	 * The file is read from the disk and render a placeholder element.
	 * When the file is successfully uploaded, the temporary placeholder is replaced with the target URL (the URL to the uploaded file on the server).
	 *
	 * @protected
	 * @param {module:upload/filerepository~FileLoader} loader
	 * @param {module:engine/model/element~Element} placeholderElement
	 * @returns {Promise}
	 */
	_readAndUpload( loader, placeholderElement ) {
		const editor = this.editor;
		const model = editor.model;
		const t = editor.locale.t;
		const fileRepository = editor.plugins.get( FileRepository );
		const notification = editor.plugins.get( Notification );

		model.enqueueChange( 'transparent', writer => {
			writer.setAttribute( 'uploadStatus', 'reading', placeholderElement );
		} );

		return loader.read()
			.then( () => {
				const promise = loader.upload();

				model.enqueueChange( 'transparent', writer => {
					writer.setAttribute( 'uploadStatus', 'uploading', placeholderElement );
				} );

				csl.ckEditorWidget.showLoadingProgress(editor, 0.5);

				return promise;
			} )
			.then( data => {
				model.enqueueChange( 'transparent', writer => {
                    //update attribute for upload status
                    writer.setAttributes( { uploadStatus: 'complete' }, placeholderElement );
					//replace placeholder with Link
					writer.setSelection( placeholderElement, 'in' );
                    const linkedText = writer.createText( (data.name || data.default), { linkHref: data.default } );
					model.insertContent( linkedText );
				} );

				clean();
			} )
			.catch( error => {
				// If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
				// it might be generic error and it would be real pain to find what is going on.
				if ( loader.status !== 'error' && loader.status !== 'aborted' ) {
					throw error;
				}

				// Might be 'aborted'.
				if ( loader.status == 'error' && error ) {
					notification.showWarning( error, {
						title: t( 'Upload failed' ),
						namespace: 'upload'
					} );
				}

				clean();

				// Permanently remove image from insertion batch.
				model.enqueueChange( 'transparent', writer => {
					writer.remove( placeholderElement );
				} );
			} );

		function clean() {
			model.enqueueChange( 'transparent', writer => {
				writer.removeAttribute( 'uploadId', placeholderElement );
				writer.removeAttribute( 'uploadStatus', placeholderElement );
			} );

			fileRepository.destroyLoader( loader );

			csl.ckEditorWidget.hideLoadingProgress(editor);
		}
	}

	getExt(fileName){
		return fileName ? fileName.substr(fileName.lastIndexOf('.')).toLowerCase() : '';
    }
}

function filterFromChangeItem( editor, item ) {
    return Array.from( editor.model.createRangeOn( item ) )
		.filter( value => { 
			return value.item.hasAttribute('uploadId') || value.item.is('element', 'paragraph');})
		.map( value => value.item );
}
