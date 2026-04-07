export const DEFAULT_TEMPLATE_ID = "basic-front-template";

function getDefaultTextColor(product) {
    return product?.color_label?.toLowerCase?.().includes("blanc") ? "#111111" : "#ffffff";
}

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

export function createDefaultCustomization(product) {
    const defaultTextColor = getDefaultTextColor(product);

    return {
        view: "front",
        product_color: product?.color_label || "default",
        template_id: DEFAULT_TEMPLATE_ID,
        text_style: { color: defaultTextColor, },
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