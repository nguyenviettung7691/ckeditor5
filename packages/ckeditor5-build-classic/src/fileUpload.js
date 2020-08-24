import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';

export default class FileUpload extends Plugin {
    init() {
        // Custom FileUpload button
        editor.ui.componentFactory.add( 'fileUpload', locale => {
            const view = new FileDialogButtonView( locale );
            const command = editor.commands.get( 'imageUpload' );
            const fileTypes = editor.config.get( 'file.upload.types' );
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

            view.buttonView.bind( 'isEnabled' ).to( command );

            view.on( 'done', ( evt, files ) => {
                const filesToUpload = Array.from( files ).filter( file => fileTypesRegExp.test( file.type ) );

                if ( filesToUpload.length ) {
                    editor.execute( 'imageUpload', { file: filesToUpload } );
                }
            } );

            return view;
        } );
    }
}