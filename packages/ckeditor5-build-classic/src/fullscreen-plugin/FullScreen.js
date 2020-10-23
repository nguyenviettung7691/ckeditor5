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
            let classicEditorFullsceen = 0; //si 0 position normale
            let inlineEditorFullsceen = 0;
            view.set( {
                label: 'Fullscreen',
                icon: MaximizeIcon,
                tooltip: true
			} );

            // Callback executed once the image is clicked.
            view.on( 'execute', (event) => {
				let expandButtonNode = event.source.element;
				let expandButtonParent = expandButtonNode.parentElement;
                let isInlineEditor = false;
				while ( expandButtonParent != null ) {
					if( (expandButtonParent.className == 'ck ck-balloon-panel ck-balloon-panel_toolbar_west ck-balloon-panel_visible ck-toolbar-container') || (expandButtonParent.className == 'ck ck-balloon-panel ck-balloon-panel_toolbar_west ck-toolbar-container') ) {
                        isInlineEditor = true;
						break;
					}
					else {
                        expandButtonParent = expandButtonParent.parentElement;
					}
				}
                if (isInlineEditor) {
                    if (inlineEditorFullsceen == 1) {
						let inlineEditorParent = editor.sourceElement.parentElement;
						let bodyDocument = document.getElementsByTagName("BODY");
						inlineEditorParent.removeAttribute('id');
                        expandButtonParent.removeAttribute('id');
                        view.set( {
                            label: 'Fullscreen',
                            icon: MaximizeIcon,
                            tooltip: true
                        } );
						bodyDocument[0].removeAttribute('style');
						let dataOnExit = editor.getData();
						editor.setData(dataOnExit);
						editor.editing.view.focus();
						inlineEditorFullsceen=0;
                    }
                    else {
						let inlineEditorParent = editor.sourceElement.parentElement;
                        expandButtonParent.id = "toolbarInlineEditorFullscreen";
                        inlineEditorParent.id = "bodyInlineEditorFullscreen";
                        view.set( {
                            label: 'Exit Fullscreen',
                            icon: MinimizeIcon,
                            tooltip: true
						} );
						let bodyDocument = document.getElementsByTagName("BODY");
						bodyDocument[0].style.overflow = "hidden";
                        inlineEditorFullsceen=1;
                    }
				}
				else {
					expandButtonParent = expandButtonNode.parentElement;
					while ( expandButtonParent != null ) {
						if(expandButtonParent.className == 'ck ck-reset ck-editor ck-rounded-corners') {
							break;
						}
						else {
							expandButtonParent = expandButtonParent.parentElement;
						}
					}
					if (classicEditorFullsceen == 1) {
						expandButtonParent.removeAttribute('id');
						view.set( {
							label: 'Fullscreen',
							icon: MaximizeIcon,
							tooltip: true
						} );
						let bodyDocument = document.getElementsByTagName("BODY");
						bodyDocument[0].removeAttribute('style');
						classicEditorFullsceen=0;
					}
					else {
						expandButtonParent.id = "classicEditorFullscreen";
						view.set( {
							label: 'Exit Fullscreen',
							icon: MinimizeIcon,
							tooltip: true
						} );
						let bodyDocument = document.getElementsByTagName("BODY");
						bodyDocument[0].style.overflow = "hidden";
						classicEditorFullsceen=1;
					}
				}
            } );

            return view;
        } );
    }
}
