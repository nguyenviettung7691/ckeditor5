import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import MaximizeIcon from './icons/maximize.svg';
import MinimizeIcon from './icons/minimize.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import './css/style.css';

export default class FullScreen extends Plugin {
    init() {
        const editor = this.editor;
        editor.ui.componentFactory.add( 'fullScreen', locale => {
            const view = new ButtonView( locale );
            let etatWiki = 0; //si 0 position normale
            let etatWall = 0;
            view.set( {
                label: 'Fullscreen',
                icon: MaximizeIcon,
                tooltip: true
            } );

            // Callback executed once the image is clicked.
            view.on( 'execute', () => {
                let wiki = document.getElementsByClassName("ck ck-reset ck-editor ck-rounded-corners");
                if (wiki.length !== 0) {
                    if (etatWiki==1) {
                        wiki[0].removeAttribute('id');
                        view.set( {
                            label: 'Fullscreen',
                            icon: MaximizeIcon,
                            tooltip: true
                        } );
                        etatWiki=0;
                    }
                    else {
                        wiki[0].id = "wikiFullscreen";
                        view.set( {
                            label: 'Exit Fullscreen',
                            icon: MinimizeIcon,
                            tooltip: true
                        } );
                        etatWiki=1;
                    }
                }
                else {
                    if (etatWall==1) {
                        let wallToolbar = document.getElementsByClassName("ck ck-balloon-panel ck-balloon-panel_toolbar_west ck-toolbar-container");
                        let wallToolbarLength = wallToolbar.length;
                        let wallEditor = document.getElementsByClassName("panel panel-default clearfix");
                        let wallEditorLength = wallEditor.length;
                        let wallToolbarIndex = wallToolbarLength - 1;
                        let wallEditorIndex = wallEditorLength - 1;
                        wallToolbar[wallToolbarIndex].removeAttribute('id');
                        wallEditor[wallEditorIndex].removeAttribute('id');

                        let content = document.getElementById("topbar-first");
                        content.click();
                        view.set( {
                            label: 'Fullscreen',
                            icon: MaximizeIcon,
                            tooltip: true
                        } );
                        etatWall=0;
                    }
                    else {
                        let wallToolbar = document.getElementsByClassName("ck ck-balloon-panel ck-balloon-panel_toolbar_west ck-toolbar-container");
                        let wallToolbarLength = wallToolbar.length;
                        let wallEditor = document.getElementsByClassName("panel panel-default clearfix");
                        let wallEditorLength = wallEditor.length;
                        let wallToolbarIndex = wallToolbarLength - 1;
                        let wallEditorIndex = wallEditorLength - 1;
                        wallToolbar[wallToolbarIndex].id = "toolbarFullscreen";
                        wallEditor[wallEditorIndex].id = "editorFullscreen"

                        view.set( {
                            label: 'Exit Fullscreen',
                            icon: MinimizeIcon,
                            tooltip: true
                        } );
                        etatWall=1;
                    }
                }
            } );

            return view;
        } );
    }
}
