import {getProductCustomizerConfig} from "./productCustomizerConfigs";

export const DEFAULT_TEMPLATE_ID = "basic-front-template";

// Picks a text color that contrasts with the product's base color
function getDefaultTextColor(product, selectedColorCode) {
    const colorCode = selectedColorCode || product?.color_code || "";
    return colorCode === "white" ? "#111111" : "#ffffff";
}

// Default disabled pattern/gradient style
function createDefaultStyleSide() {
    return {
        pattern: {
            enabled: false,
            id: null,
        },
        gradient: {
            enabled: false,
            id: null,
        },
    };
}

// Builds the initial customization state for a product
export function createDefaultCustomization(product) {
    const customizerConfig = getProductCustomizerConfig(product);

    const defaultProductColor =
        product?.color_code ||
        customizerConfig?.availableColors?.[0] ||
        "default";

    const defaultTextColor = getDefaultTextColor(product, defaultProductColor);

    return {
        view: "front",
        product_color: defaultProductColor,
        template_id: DEFAULT_TEMPLATE_ID,

        text_style: {
            color: defaultTextColor,
        },

        text_layers: [],
        image_layers: [],

        player_name: {
            value: "",
            color: defaultTextColor,
            x: 275,
            y: 385,
        },

        player_number: {
            value: "",
            color: defaultTextColor,
            x: 342,
            y: 285,
        },

        logo: {
            enabled: false,
            type: "badge",
            src: "",
            x: 245,
            y: 220,
            width: 64,
            height: 64,
        },

        style: {
            front: createDefaultStyleSide(),
            back: createDefaultStyleSide(),
        },
    };
}