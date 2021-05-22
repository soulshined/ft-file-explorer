type IElement = ElementBuilder | HTMLElement;

class ElementBuilder {
    private node: HTMLElement;

    constructor(tagName?: string) {
        if (tagName)
            this.node = document.createElement(tagName.toUpperCase());
    }

    innerHTML(html: string) {
        this.node.innerHTML = html;
        return this;
    }

    innerText(text: string) {
        this.node.innerText = text;
        return this;
    }

    styles(styles: string) {
        this.node.style.cssText += `;${styles}`;
        return this;
    }

    id(value: string) {
        this.node.id = value;
        return this;
    }

    addClass(...args: string[]) {
        args.forEach(arg => {
            if (!this.node.classList.contains(arg)) this.node.classList.add(arg);
        })
        return this;
    }

    attr(attr: string, val: any) {
        this.node.setAttribute(attr, val);
        return this;
    }

    prepend(child: IElement) {
        this.node.prepend(child instanceof ElementBuilder ? child.build() : child);
        return this;
    }

    append(...child: (IElement | Text)[]) {
        child.forEach(element => {
            this.node.appendChild((element instanceof ElementBuilder) ? element.build() : element);
        });
        return this;
    }

    build(): HTMLElement {
        return this.node;
    }

    public static from(element: IElement, includeChildren = true) {
        const builder = new ElementBuilder('');
        builder.node = (element instanceof ElementBuilder)
            ? element.node.cloneNode(includeChildren) as HTMLElement
            : element.cloneNode(includeChildren) as HTMLElement;
        return builder;
    }

    public static newSubtree() {
        return new ElementBuilder("li").addClass('subtree')
                .append(new ElementBuilder('ul')
                    .append(new ElementBuilder('li').addClass('folders')
                        .append(new ElementBuilder('ul'))
                    )
                    .append(new ElementBuilder('li').addClass('files')
                        .append(new ElementBuilder('ul'))
                    )
                )
    }

}

