"use strict";

/**
 * Essential components
 */
import { CookieComponent } from "./components/cookie.component";
new CookieComponent();

import { ResponsiveBackgroundComponent } from "./components/responsiveBackground.component";
new ResponsiveBackgroundComponent();

import { WebfontComponent } from "./components/webfont.component";
new WebfontComponent([
  "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
]);

/**
 * Extra components
 */
import { FlyoutComponent } from "./components/flyout.component";
new FlyoutComponent();

import { ValidationComponent } from "./components/validation.component";
// new ValidationComponent();
import { CountdownPlugin } from "./plugins/validation/countdown.plugin";
import { PasswordConfirmPlugin } from "./plugins/validation/passwordConfirm.plugin";
new ValidationComponent({ plugins: [CountdownPlugin, PasswordConfirmPlugin] });

import { FormOptionalBlocks } from "./components/formOptionalBlocks.component";
new FormOptionalBlocks();

import { ToggleComponent } from "./components/toggle.component";
new ToggleComponent();

import { SearchComponent } from "./components/search.component";
new SearchComponent();

import { FilterComponent } from "./components/filter.component";
new FilterComponent();

import { IndeterminateChecksComponent } from "./components/indeterminateChecks.component";
new IndeterminateChecksComponent();

import { LoadMoreComponent } from "./components/loadmore.component";
new LoadMoreComponent();

import { GlideComponent } from "./components/gilde.component";
new GlideComponent();

import { ModalComponent } from "./components/modal.component";
new ModalComponent();

import { GoogleMapsComponent } from "./components/googleMaps.component";
new GoogleMapsComponent();

import { MasonryComponent } from "./components/masonry.component";
new MasonryComponent();

import { DropdownComponent } from "./components/dropdown.component";
new DropdownComponent();

import { AutocompleteComponent } from "./components/autocomplete.component";
new AutocompleteComponent();

import { DatePickerComponent } from "./components/datepicker.component";
new DatePickerComponent();

import { ScrollToAnchorComponent } from "./components/scrollToAnchor.component";
new ScrollToAnchorComponent();

// import "./components/lazySizes.component";

/**
 * Icon font generation
 * DO NOT REMOVE !!
 */
import "../icons/iconfont.font";
/**
 * CSS import
 * DO NOT REMOVE !!
 */
import "../css/main.css";
