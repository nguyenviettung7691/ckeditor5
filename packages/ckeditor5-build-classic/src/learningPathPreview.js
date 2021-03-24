import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class LearningPathPreview extends Plugin {
	constructor(editor) {
		super(editor);

		/**
		 * @const {number} the delay time in ms
		 */
		const delayTime = 500;

		/**
		 * @type {number} the global timer returned from setTimeout
		 */
		let timer = 0;

		editor.model.document.on("change:data", () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				let dataInput = editor.getData();
				let dataInputContent = dataInput.replace(
					/<\s*a[^>]*>|<\s*\/\s*a>/g,
					"|a|"
				);
				let dataInputContent2 = dataInputContent.replace(
					/<[^>]+>/g,
					" "
				);
				let finalContentArray = dataInputContent2.split(" ");
				//Kiem tra co phai link learningPath ko
				let filteredLinksArray = finalContentArray.filter(
					(link) =>
						link.includes("fromlmm") == true &&
						link.includes("|a|") == true
				);
				let learningPathIdArray = [];
				for (let i = 0; i < filteredLinksArray.length; i++) {
					//Chat learningPathId ra
					let startIndex =
						filteredLinksArray[i].indexOf("/learning-path/") + 15;
					let learningPathId = filteredLinksArray[i].substr(
						startIndex,
						36
					);
					//Ultimate check if learningPathId is not GUID then bypass to the next loop
					let regexGUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
					if (!regexGUID.test(learningPathId)) {
						continue;
					}
					//Neu co roi thi ko them vo mang nua
					let findResult = learningPathIdArray.find(
						(id) => id == learningPathId
					);
					if (findResult == undefined) {
						learningPathIdArray.push(learningPathId);
					}
				}
				csl.ckEditorWidget.renderLearningPathPreview(
					editor,
					learningPathIdArray
				);
			}, delayTime);
		});
	}
}
