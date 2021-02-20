import { Plugin, MarkdownPreviewRenderer, MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian';

const markdownImageExts = /\.png|jpe?g|gif|bmp|svg|tiff/gim

export default class MyPlugin extends Plugin {

	isImageLink(link: string): boolean {
		return !!link.match(markdownImageExts);
	}

	imagePostProcessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const embeds = el.querySelectorAll('.internal-embed');
		if (!embeds.length) return;

		const imgEmbeds = Array.prototype.filter.call(embeds, (embed: HTMLElement) => this.isImageLink(embed.getAttribute('src')));
		if (imgEmbeds.length > 1) el.addClass('image-gallery');

		imgEmbeds.forEach((el: HTMLElement) => this.processImage(el));
	}

	processImage(el: HTMLElement) {
		this.wrapImageWithCaption(el);
	}

	wrapImageWithCaption(el: HTMLElement) {
		const caption = this.getImageCaption(el);
		if (!caption) return;

		const figure = el.parentNode.createEl('figure');
		el.parentNode.insertBefore(figure, el);
		figure.addClass('image-wrapper')
		figure.appendChild(el);

		const figcaption = figure.createEl('figcaption');
		figcaption.addClass('image-caption')
		figcaption.appendChild(caption);
	}

	getImageCaption(el: Node): Node | void {
		if (!el.nextSibling) return;
		const next = el.nextSibling;

		switch (next.nodeName.toLowerCase()) {
			case "#text":
				if (next.textContent.trim() !== '') return;
				return this.getImageCaption(next);
			case 'br':
				return this.getImageCaption(next);
			case 'em':
				return next;
			default:
				return;
		}
	}

	async onload() {
		console.log('loading ' + this.manifest.id);
		MarkdownPreviewRenderer.registerPostProcessor(this.imagePostProcessor);
	}

	onunload() {
		console.log('unloading ' + this.manifest.id);
		MarkdownPreviewRenderer.unregisterPostProcessor(this.imagePostProcessor);
	}
}
