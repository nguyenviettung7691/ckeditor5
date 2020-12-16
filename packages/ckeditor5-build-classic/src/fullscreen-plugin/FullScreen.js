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

			let liftUpLinkPlugin = function () {
				let linkPlugin = editor.plugins.get('Link');
				let linkPluginPopup = linkPlugin.editor.ui.view.body._parentElement;
				let linkPluginPopupToLift = linkPluginPopup.children[0];
				linkPluginPopupToLift.style.zIndex = "10000";
			};
            // Callback executed once the expand button is clicked.
            view.on( 'execute', (event) => {
				function restartBodyOverflow() {
					event.source.element.click();
					setTimeout(function() {window.removeEventListener('popstate', restartBodyOverflow)}, 1000);
				}
				window.addEventListener('popstate', restartBodyOverflow);
				let innerHeightCalculated = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
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
					function setInnerHeightCalculated(evt, name, isFocused) {
						if (!isFocused) {
							let inlineEditorBlur = editor.sourceElement;
							inlineEditorBlur.style.maxHeight = innerHeightCalculated + "px";
							inlineEditorBlur.style.overflowY = "auto";
						}
						else {
							let inlineEditorBlur = editor.sourceElement;
							inlineEditorBlur.style.maxHeight = innerHeightCalculated + "px";
							inlineEditorBlur.style.overflowY = "auto";
						}
					};
                    if (inlineEditorFullsceen == 1) {
						//Start removing event listener from Link/MathInput/BrokenLink button
						let toolbarItems = expandButtonParent.firstElementChild;
						while (toolbarItems != null) {
							if(toolbarItems.className == 'ck ck-toolbar__items') {
								break;
							}
							else {
								toolbarItems = toolbarItems.firstElementChild;
							}
						}
						let linkButton = toolbarItems.children[10];
						linkButton.removeEventListener("click", liftUpLinkPlugin, false);
						//End
						let inlineEditor = editor.sourceElement;
						let inlineEditorParent = editor.sourceElement.parentElement;
						let bodyDocument = document.getElementsByTagName("BODY");
						//Start removing max-height for editable region
						inlineEditor.removeAttribute('style');
						editor.ui.focusTracker.off('change:isFocused');
						//End
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
						//Start finding Link/MathInput/BrokenLink button to add event listener
						let toolbarItems = expandButtonParent.firstElementChild;
						while (toolbarItems != null) {
							if(toolbarItems.className == 'ck ck-toolbar__items') {
								break;
							}
							else {
								toolbarItems = toolbarItems.firstElementChild;
							}
						}
						let linkButton = toolbarItems.children[10];
						linkButton.addEventListener("click", liftUpLinkPlugin, false);
						//End
						let inlineEditor = editor.sourceElement;
						let inlineEditorParent = editor.sourceElement.parentElement;
						//Start setting max-height for editable region (so that the vertical scrollbar can auto display/hide)
						inlineEditor.style.maxHeight = innerHeightCalculated + "px";
						inlineEditor.style.overflow = "auto";
						editor.ui.focusTracker.on('change:isFocused', setInnerHeightCalculated);
						//End
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
					function setInnerHeightCalculated(evt, name, isFocused) {
						if (!isFocused) {
							let inlineEditorMainBlur = expandButtonParent.children[2];
							let inlineEditorBlur = inlineEditorMainBlur.children[0];
							inlineEditorBlur.style.maxHeight = innerHeightCalculated + "px";
							inlineEditorBlur.style.height = innerHeightCalculated + "px";
							inlineEditorBlur.style.overflow = "auto";
							inlineEditorMainBlur.style.height = innerHeightCalculated + "px";
						}
						else {
							let inlineEditorMainFocus = expandButtonParent.children[2];
							let inlineEditorFocus = inlineEditorMainFocus.children[0];
							inlineEditorFocus.style.maxHeight = innerHeightCalculated + "px";
							inlineEditorFocus.style.height = innerHeightCalculated + "px";
							inlineEditorFocus.style.overflow = "auto";
							inlineEditorMainFocus.style.height = innerHeightCalculated + "px";
						}
					};
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
						let inlineEditorMain = expandButtonParent.children[2];
						let inlineEditor = inlineEditorMain.children[0];
						//Start finding Link/MathInput/BrokenLink button to add event listener
						let toolbarGroup = expandButtonNode.parentElement;
						while ( toolbarGroup != null ) {
							if(toolbarGroup.className == 'ck ck-toolbar ck-toolbar_grouping') {
								break;
							}
							else {
								toolbarGroup = toolbarGroup.parentElement;
							}
						}
						let toolbarItems = toolbarGroup.firstElementChild;
						while (toolbarItems != null) {
							if(toolbarItems.className == 'ck ck-toolbar__items') {
								break;
							}
							else {
								toolbarItems = toolbarItems.firstElementChild;
							}
						}
						let linkButton = toolbarItems.children[10];
						linkButton.removeEventListener("click", liftUpLinkPlugin, false);
						//End
						//Start removing max-height for editable region
						inlineEditor.removeAttribute('style');
						inlineEditorMain.removeAttribute('style');
						editor.ui.focusTracker.off('change:isFocused');
						//End
						//Apply in share mode
						let globalModal = document.querySelector('[id="globalModal"], [class="modal in"]');
						if (globalModal != null) {
							globalModal.className = "modal in";
						}
						//End
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
						//Start finding Link/MathInput/BrokenLink button to add event listener
						let toolbarGroup = expandButtonNode.parentElement;
						while ( toolbarGroup != null ) {
							if(toolbarGroup.className == 'ck ck-toolbar ck-toolbar_grouping') {
								break;
							}
							else {
								toolbarGroup = toolbarGroup.parentElement;
							}
						}
						let toolbarItems = toolbarGroup.firstElementChild;
						while (toolbarItems != null) {
							if(toolbarItems.className == 'ck ck-toolbar__items') {
								break;
							}
							else {
								toolbarItems = toolbarItems.firstElementChild;
							}
						}
						let linkButton = toolbarItems.children[10];
						linkButton.addEventListener("click", liftUpLinkPlugin, false);
						//End
						expandButtonParent.id = "classicEditorFullscreen";
						let inlineEditorMain = expandButtonParent.children[2];
						let inlineEditor = inlineEditorMain.children[0];
						//Start setting max-height for editable region (so that the vertical scrollbar can auto display/hide)
						inlineEditor.style.maxHeight = innerHeightCalculated + "px";
						inlineEditor.style.height = innerHeightCalculated + "px";
						inlineEditor.style.overflow = "auto";
						inlineEditorMain.style.height = innerHeightCalculated + "px";
						editor.ui.focusTracker.on('change:isFocused', setInnerHeightCalculated);
						//End
						//Apply in share mode
						let globalModal = document.querySelector('[id="globalModal"], [class="modal in"]');
						if (globalModal != null) {
							globalModal.className = "modal in fullscreen";
						}
						//End
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
