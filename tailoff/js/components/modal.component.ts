import { ArrayPrototypes } from "../utils/prototypes/array.prototypes";
import { SiteLang } from "../utils/site-lang";
import { A11yUtils } from "../utils/a11y";
import "wicg-inert";

ArrayPrototypes.activateFrom();

export class ModalComponent {
  private lang = require(`../i18n/s-modal-${SiteLang.getLang()}.json`);

  private options = {
    closeHTML: `<span class="icon icon--clear" aria-hidden="true"></span>`,
    nextHTML: `<span class="icon icon--arrow-right" aria-hidden="true"></span>`,
    prevHTML: `<span class="icon icon--arrow-left" aria-hidden="true"></span>`,
    imageMargin: 20,
    imageMarginNav: 80,
    imageMarginNoneBreakPoint: 820,
    resizeDuration: 100,
    fadeDuration: 100,
  };

  private bodyElement: HTMLBodyElement;
  private modalOverlay: HTMLDivElement;
  private modal: HTMLDivElement;
  private modalClose: HTMLButtonElement;
  private modalContent: HTMLDivElement;
  private closeListener;
  private trigger: HTMLElement;
  private image: HTMLImageElement;
  private imageResizeListener;
  private modalLoader: HTMLDivElement;
  private galleryGroup: Array<string>;
  private galleryType: string;
  private nextButton: HTMLButtonElement;
  private prevButton: HTMLButtonElement;
  private currentGroupIndex: number = 0;
  private navListener;
  private firstTabbableElement: Element;
  private lastTabbableElement: Element;
  private imageTabTrapListener;
  private inlineContentWrapper: HTMLElement;
  private mainContentBlock: HTMLElement;

  constructor(options: Object = {}) {
    this.options = { ...this.options, ...options };

    this.mainContentBlock = document.getElementById("mainContentBlock");
    this.bodyElement = document.getElementsByTagName(
      "BODY"
    )[0] as HTMLBodyElement;

    const triggers = document.querySelectorAll(".js-modal");
    Array.from(triggers).forEach((trigger) => {
      this.initTrigger(trigger);
    });

    const imageTriggers = document.querySelectorAll(".js-modal-image");
    Array.from(imageTriggers).forEach((trigger) => {
      this.initImageTrigger(trigger);
    });

    const videoTriggers = document.querySelectorAll(".js-modal-video");
    Array.from(videoTriggers).forEach((trigger) => {
      this.initVideoTrigger(trigger);
    });

    this.initTriggerClick();
  }

  private initTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
  }

  private initImageTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
    trigger.classList.add("modal__image-trigger");
  }

  private initVideoTrigger(trigger: Element) {
    trigger.setAttribute("role", "button");
    trigger.classList.add("modal__video-trigger");
  }

  private initTriggerClick() {
    document.addEventListener(
      "click",
      (e) => {
        // loop parent nodes from the target to the delegation node
        for (
          let target = <Element>e.target;
          target && !target.isSameNode(document);
          target = target.parentElement
        ) {
          if (
            target.matches(".js-modal") ||
            target.matches(".js-modal-image") ||
            target.matches(".js-modal-video")
          ) {
            e.preventDefault();
            this.openModalClick(target as HTMLElement);
            break;
          }
        }
      },
      false
    );
  }

  private openModalClick(trigger: HTMLElement) {
    this.trigger = trigger;
    if (trigger.classList.contains("js-modal")) {
      if (trigger.tagName === "A") {
        this.openInlineModal(
          (trigger as HTMLAnchorElement).getAttribute("href")
        );
      } else {
        const id = trigger.getAttribute("data-modal-id");
        id
          ? this.openInlineModal(id)
          : console.log("No modal id is provided on the trigger");
      }
    }
    if (trigger.classList.contains("js-modal-image")) {
      const src = this.getTriggerSrc(trigger);
      src
        ? this.openImageModal(src)
        : console.log("No modal src is provided on the trigger");
    }
    if (trigger.classList.contains("js-modal-video")) {
      const src = this.getTriggerSrc(trigger);
      src
        ? this.openVideoModal(src)
        : console.log("No modal src is provided on the trigger");
    }
    document.body.classList.add("has-open-modal");
  }

  private getTriggerSrc(trigger: Element) {
    if (trigger.tagName === "A") {
      return (trigger as HTMLAnchorElement).getAttribute("href");
    } else {
      const src = trigger.getAttribute("data-modal-src");
      return src ? src : null;
    }
  }

  private openInlineModal(id: string) {
    this.createOverlay();
    this.createModal();

    this.inlineContentWrapper = document.querySelector(id);
    if (this.inlineContentWrapper) {
      // this.modalContent.insertAdjacentHTML("afterbegin", content.innerHTML);
      Array.from(this.inlineContentWrapper.children).forEach((element) => {
        this.modalContent.insertAdjacentElement("beforeend", element);
      });
      this.linkAccesebilityToDialog();
    } else {
      this.modalContent.insertAdjacentHTML(
        "afterbegin",
        `<h1>Error</h1><p>${this.lang.contentError}</p>`
      );
    }

    this.trapTab();
  }

  private openImageModal(src: string) {
    this.galleryType = "image";
    this.createOverlay();
    this.createModal("image");

    this.galleryGroup = [];
    const group = this.trigger.getAttribute("data-group");
    if (group) {
      this.galleryGroup = Array.from(
        document.querySelectorAll(`[data-group=${group}]`)
      ).map((t) => this.getTriggerSrc(t));
      this.currentGroupIndex = this.galleryGroup.indexOf(src);
      this.addNavigation();
    }

    this.modalLoader = document.createElement("div");
    this.modalLoader.classList.add("modal__loader-wrapper");
    this.modalLoader.insertAdjacentHTML(
      "afterbegin",
      `<div class="modal__loader"></div>`
    );
    this.modalContent.insertAdjacentElement("afterbegin", this.modalLoader);

    this.image = document.createElement("img");
    this.image.addEventListener("load", (e) => {
      this.modalLoader.classList.add("hidden");
      this.setImageSize(null, true);
    });
    this.image.setAttribute("src", src);
    this.image.classList.add("hidden");
    this.modalContent.insertAdjacentElement("afterbegin", this.image);

    this.imageResizeListener = this.setImageSize.bind(this);
    window.addEventListener("resize", this.imageResizeListener);

    this.initGalleryTabTrap();
  }

  private openVideoModal(src: string) {
    this.galleryType = "video";
    this.createOverlay();
    this.createModal("video");

    this.galleryGroup = [];
    const group = this.trigger.getAttribute("data-group");

    if (group) {
      this.galleryGroup = Array.from(
        document.querySelectorAll(`[data-group=${group}]`)
      ).map((t) => this.getTriggerSrc(t));
      this.currentGroupIndex = this.galleryGroup.indexOf(src);
      this.addNavigation();
    }

    this.loadVideo(src);

    this.initGalleryTabTrap();
  }

  private loadVideo(src: string) {
    const iframe = this.modalContent.querySelector("iframe");
    if (iframe) {
      iframe.parentElement.removeChild(iframe);
    }
    const youtubeEmbed = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${this.getYoutubeId(
      src
    )}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    this.modalContent.insertAdjacentHTML("afterbegin", youtubeEmbed);
  }

  private getYoutubeId(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  private createOverlay() {
    this.modalOverlay = document.createElement("div");
    this.modalOverlay.classList.add("modal__overlay");
    this.modalOverlay.addEventListener("click", () => {
      this.closeModal();
    });
    this.bodyElement.insertAdjacentElement("beforeend", this.modalOverlay);
  }

  private createModal(type = "") {
    this.modal = document.createElement("div");
    this.modal.classList.add("modal__dialog");
    type == "image" && this.modal.classList.add("modal__dialog--image");
    type == "video" && this.modal.classList.add("modal__dialog--video");
    this.modal.setAttribute("role", "dialog");
    // this.modal.setAttribute("aria-selected", "true");
    this.modal.setAttribute("aria-label", this.lang.dialogLabel);

    this.modalClose = document.createElement("button");
    this.modalClose.classList.add("modal__close");
    this.modalClose.setAttribute("type", "button");
    // this.modalClose.setAttribute("aria-label", this.lang.closeLabel);
    this.modalClose.insertAdjacentHTML(
      "beforeend",
      `<span class="sr-only">${this.lang.closeLabel}</span>`
    );
    this.modalClose.insertAdjacentHTML("beforeend", this.options.closeHTML);
    this.modalClose.addEventListener("click", () => {
      this.closeModal();
    });
    this.modal.insertAdjacentElement("afterbegin", this.modalClose);

    this.modalContent = document.createElement("div");
    type == "" && this.modalContent.classList.add("modal__content");
    type == "image" && this.modalContent.classList.add("modal__image");
    type == "video" && this.modalContent.classList.add("modal__video");
    this.modalContent.setAttribute("tabindex", "-1");
    this.modal.insertAdjacentElement("beforeend", this.modalContent);

    this.closeListener = this.escKeyAction.bind(this);
    document.addEventListener("keydown", this.closeListener);

    this.bodyElement.insertAdjacentElement("beforeend", this.modal);
    this.setMainContentInert();
  }

  private linkAccesebilityToDialog() {
    // const description = this.modalContent.querySelector(
    //   ".js-modal-description"
    // );
    // if (description) {
    //   description.setAttribute("id", "js-modal-description");
    //   // this.modal.setAttribute("aria-describedby", "js-modal-description");
    // }
    let label = this.modalContent.querySelector(".js-modal-label");
    label = label
      ? label
      : this.modalContent.querySelector("h1,h2,h3,h4,h5,h6");
    if (label) {
      label.setAttribute("id", "js-modal-label");
      this.modal.setAttribute("aria-labelledby", "js-modal-label");
    }
  }

  private setImageSize(_, newImage = false) {
    let imageWidth = this.image.naturalWidth;
    let imageHeight = this.image.naturalHeight;
    let maxWidth = window.innerWidth;
    let maxHeight = window.innerHeight;

    if (window.innerWidth > this.options.imageMarginNoneBreakPoint) {
      maxWidth = this.galleryGroup.length
        ? window.innerWidth - this.options.imageMarginNav * 2
        : window.innerWidth - this.options.imageMargin * 2;
      maxHeight = window.innerHeight - this.options.imageMargin * 2;
    }

    if (imageWidth > maxWidth || imageHeight > maxHeight) {
      if (imageWidth / maxWidth >= imageHeight / maxHeight) {
        imageHeight *= maxWidth / imageWidth;
        imageWidth = maxWidth;
      } else {
        imageWidth *= maxHeight / imageHeight;
        imageHeight = maxHeight;
      }
    }

    if (this.options.resizeDuration === 0 || !newImage) {
      this.modalContent.style.width = `${Math.round(imageWidth)}px`;
      this.modalContent.style.height = `${Math.round(imageHeight)}px`;
      this.image.classList.remove("hidden");
    } else {
      this.cssPropertyAnimation(
        this.modalContent,
        "width",
        Math.round(imageWidth),
        "px",
        this.options.resizeDuration
      );
      this.cssPropertyAnimation(
        this.modalContent,
        "height",
        Math.round(imageHeight),
        "px",
        this.options.resizeDuration,
        () => {
          this.image.style.opacity = "0";
          this.image.classList.remove("hidden");
          this.cssPropertyAnimation(
            this.image,
            "opacity",
            1,
            "",
            this.options.fadeDuration
          );
        }
      );
    }
  }

  private addNavigation() {
    this.nextButton = document.createElement("button");
    this.nextButton.classList.add("modal__navigation");
    this.nextButton.classList.add("modal__next-button");
    this.nextButton.setAttribute("type", "button");
    this.nextButton.setAttribute("aria-label", this.lang.nextLabel);
    this.nextButton.insertAdjacentHTML(
      "beforeend",
      `<span class="sr-only">${this.lang.nextText}</span>`
    );
    this.nextButton.insertAdjacentHTML("beforeend", this.options.nextHTML);
    this.nextButton.addEventListener("click", this.gotoNextItem.bind(this));
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.classList.add("hidden");
      this.nextButton.setAttribute("disabled", "");
    }
    this.modalContent.insertAdjacentElement("beforeend", this.nextButton);

    this.prevButton = document.createElement("button");
    this.prevButton.classList.add("modal__navigation");
    this.prevButton.classList.add("modal__prev-button");
    this.prevButton.setAttribute("type", "button");
    this.prevButton.setAttribute("aria-label", this.lang.prevLabel);
    this.prevButton.insertAdjacentHTML(
      "beforeend",
      `<span class="sr-only">${this.lang.prevText}</span>`
    );
    this.prevButton.insertAdjacentHTML("beforeend", this.options.prevHTML);
    this.prevButton.addEventListener("click", this.gotoPrevItem.bind(this));
    if (this.currentGroupIndex === 0) {
      this.prevButton.classList.add("hidden");
      this.prevButton.setAttribute("disabled", "");
    }
    this.modalContent.insertAdjacentElement("beforeend", this.prevButton);

    this.navListener = this.keyBoardNavigation.bind(this);
    document.addEventListener("keydown", this.navListener);
  }

  private gotoNextItem() {
    this.prevButton.classList.remove("hidden");
    this.prevButton.removeAttribute("disabled");
    if (this.currentGroupIndex < this.galleryGroup.length - 1) {
      this.currentGroupIndex++;
      if (this.galleryType == "image") {
        this.image.classList.add("hidden");
        this.modalLoader.classList.remove("hidden");
        this.image.setAttribute(
          "src",
          this.galleryGroup[this.currentGroupIndex]
        );
      }
      if (this.galleryType == "video") {
        this.loadVideo(this.galleryGroup[this.currentGroupIndex]);
      }
    }
    if (this.currentGroupIndex === this.galleryGroup.length - 1) {
      this.nextButton.classList.add("hidden");
      this.nextButton.setAttribute("disabled", "");
      this.prevButton.focus();
    }
    this.updateGalleryTabIndexes();
  }

  private gotoPrevItem() {
    this.nextButton.classList.remove("hidden");
    this.nextButton.removeAttribute("disabled");
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      if (this.galleryType == "image") {
        this.image.classList.add("hidden");
        this.modalLoader.classList.remove("hidden");
        this.image.setAttribute(
          "src",
          this.galleryGroup[this.currentGroupIndex]
        );
      }
      if (this.galleryType == "video") {
        this.loadVideo(this.galleryGroup[this.currentGroupIndex]);
      }
    }
    if (this.currentGroupIndex === 0) {
      this.prevButton.classList.add("hidden");
      this.prevButton.setAttribute("disabled", "");
      this.nextButton.focus();
    }
    this.updateGalleryTabIndexes();
  }

  private keyBoardNavigation(event) {
    if (
      event.keyCode === 39 ||
      event.key === "ArrowRight" ||
      (event.code === "ArrowRight" &&
        this.currentGroupIndex < this.galleryGroup.length - 1)
    ) {
      this.gotoNextItem();
    }
    if (
      event.keyCode === 37 ||
      event.key === "ArrowLeft" ||
      (event.code === "ArrowLeft" && this.currentGroupIndex > 0)
    ) {
      this.gotoPrevItem();
    }
  }

  private trapTab() {
    A11yUtils.keepFocus(this.modal);
    this.modalContent.focus();
  }

  private escKeyAction(event) {
    if (
      event.keyCode === 27 ||
      event.key === "Escape" ||
      event.code === "Escape"
    ) {
      this.closeModal();
    }
  }

  private initGalleryTabTrap() {
    this.updateGalleryTabIndexes();
    this.imageTabTrapListener = this.imagesTrapTab.bind(this);
    document.addEventListener("keydown", this.imageTabTrapListener);
    this.modalContent.focus();
  }

  private imagesTrapTab(event) {
    const keyCode = event.which || event.keyCode; // Get the current keycode

    // If it is TAB
    if (keyCode === 9) {
      // Move focus to first element that can be tabbed if Shift isn't used
      if (event.target === this.lastTabbableElement && !event.shiftKey) {
        event.preventDefault();
        (this.firstTabbableElement as HTMLElement).focus();

        // Move focus to last element that can be tabbed if Shift is used
      } else if (event.target === this.firstTabbableElement && event.shiftKey) {
        event.preventDefault();
        (this.lastTabbableElement as HTMLElement).focus();
      }
    }
  }

  private updateGalleryTabIndexes() {
    const tabbableElements = `a[href], area[href], input:not([disabled]),
        select:not([disabled]), textarea:not([disabled]),
        button:not([disabled]), iframe, object, embed, *[tabindex],
        *[contenteditable]`;

    const allTabbableElements = this.modal.querySelectorAll(tabbableElements);

    this.firstTabbableElement = allTabbableElements[0];
    this.lastTabbableElement =
      allTabbableElements[allTabbableElements.length - 1];
  }

  private closeModal() {
    document.body.classList.remove("has-open-modal");
    if (this.inlineContentWrapper) {
      Array.from(this.modalContent.children).forEach((element) => {
        this.inlineContentWrapper.insertAdjacentElement("beforeend", element);
      });
    }
    this.bodyElement.removeChild(this.modalOverlay);
    this.bodyElement.removeChild(this.modal);
    document.removeEventListener("keydown", this.closeListener);
    document.removeEventListener("keydown", this.navListener);
    document.removeEventListener("keydown", this.imageTabTrapListener);
    window.removeEventListener("resize", this.imageResizeListener);
    this.setMainContentInert(false);
    setTimeout(() => {
      //To make sure this is the last focus. Otherwise the inert plugin fucks it up.
      this.trigger.focus();
    }, 0);
  }

  private cssPropertyAnimation(
    element: HTMLElement,
    property: string,
    newValue: number,
    unit: string,
    duration: number,
    cb: Function = null
  ) {
    const startingValue = element.style[property]
      ? parseFloat(element.style[property])
      : 0;
    const diff = newValue - startingValue;
    let start;

    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);
      element.style[property] = `${startingValue + diff * percent}${unit}`;
      if (time < duration) {
        window.requestAnimationFrame(step);
      } else {
        cb && cb();
      }
    });
  }

  private setMainContentInert(set = true) {
    if (this.mainContentBlock && set) {
      this.mainContentBlock.setAttribute("inert", "");
      document.documentElement.classList.add("overflow-hidden");
    }
    if (this.mainContentBlock && !set) {
      this.mainContentBlock.removeAttribute("inert");
      document.documentElement.classList.remove("overflow-hidden");
    }
  }
}
