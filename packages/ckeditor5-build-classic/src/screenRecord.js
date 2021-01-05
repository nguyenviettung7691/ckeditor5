import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class ScreenRecord extends Plugin {
    init() {
        const editor = this.editor;
        // ScreenRecord
        editor.ui.componentFactory.add( 'screenRecord', locale => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Start screen recording',
                icon: 
                    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="511.626px" height="511.627px" viewBox="0 0 511.626 511.627" style="enable-background:new 0 0 511.626 511.627;" xml:space="preserve">
                    <g xmlns="http://www.w3.org/2000/svg">
                        <path d="M500.491,83.65c-2.474-0.95-4.853-1.427-7.139-1.427c-5.14,0-9.418,1.812-12.847,5.426l-115.06,114.776v-47.108   c0-22.653-8.042-42.017-24.126-58.102c-16.085-16.083-35.447-24.125-58.102-24.125H82.224c-22.648,0-42.016,8.042-58.102,24.125   C8.042,113.3,0,132.664,0,155.317v200.996c0,22.651,8.042,42.014,24.123,58.098c16.086,16.084,35.454,24.126,58.102,24.126h200.994   c22.654,0,42.017-8.042,58.102-24.126c16.084-16.084,24.126-35.446,24.126-58.098v-47.397l115.06,115.061   c3.429,3.613,7.707,5.424,12.847,5.424c2.286,0,4.665-0.476,7.139-1.424c7.427-3.237,11.136-8.85,11.136-16.844V100.499   C511.626,92.501,507.917,86.887,500.491,83.65z"/>
                    </g>
                    </svg>`,
                tooltip: true
            } );

            // Callback on click button
            view.on( 'execute', () => {
                csl.ckEditorWidget.showScreenRecord(editor);
            } );

            return view;
        } );
    }
}