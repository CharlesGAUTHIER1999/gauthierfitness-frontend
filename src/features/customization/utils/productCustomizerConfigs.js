const DEFAULT_TEMPLATES = ["basic-front-template", "clean-front-template"];

const CONFIGS_BY_PRODUCT_NAME = {
    "T-shirt Training": {
        productType: "tshirt",
        availableColors: ["white", "black", "grey"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 268, y: 224, width: 225, height: 162 },
                designZone: { x: 274, y: 118, width: 208, height: 380 },
                logoZone: { x: 245, y: 220, width: 64, height: 64 },
            },
            back: {
                printZone: { x: 272, y: 205, width: 215, height: 238 },
                designZone: { x: 272, y: 118, width: 205, height: 376 },
                logoZone: { x: 245, y: 220, width: 64, height: 64 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 300, y: 220, width: 165, height: 135 },
                    designZone: { x: 278, y: 118, width: 200, height: 372 },
                    logoZone: { x: 286, y: 205, width: 42, height: 42 },
                },
            },
        },
    },

    "T-shirt Oversize": {
        productType: "tshirt",
        availableColors: ["white", "black", "grey"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 260, y: 220, width: 240, height: 170 },
                designZone: { x: 266, y: 112, width: 220, height: 392 },
                logoZone: { x: 242, y: 216, width: 64, height: 64 },
            },
            back: {
                printZone: { x: 264, y: 205, width: 228, height: 245 },
                designZone: { x: 266, y: 112, width: 218, height: 388 },
                logoZone: { x: 242, y: 216, width: 64, height: 64 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 294, y: 218, width: 172, height: 138 },
                    designZone: { x: 272, y: 112, width: 208, height: 384 },
                    logoZone: { x: 282, y: 203, width: 42, height: 42 },
                },
            },
        },
    },

    "Sweat Classic": {
        productType: "sweat",
        availableColors: ["white", "black", "grey"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 258, y: 232, width: 245, height: 175 },
                designZone: { x: 264, y: 126, width: 228, height: 398 },
                logoZone: { x: 244, y: 226, width: 64, height: 64 },
            },
            back: {
                printZone: { x: 264, y: 210, width: 235, height: 252 },
                designZone: { x: 264, y: 124, width: 226, height: 392 },
                logoZone: { x: 244, y: 226, width: 64, height: 64 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 296, y: 224, width: 176, height: 142 },
                    designZone: { x: 270, y: 124, width: 214, height: 388 },
                    logoZone: { x: 284, y: 206, width: 42, height: 42 },
                },
            },
        },
    },

    "Sweat Zippe": {
        productType: "sweat",
        availableColors: ["white", "black", "red"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 266, y: 235, width: 228, height: 170 },
                designZone: { x: 270, y: 128, width: 214, height: 392 },
                logoZone: { x: 246, y: 228, width: 60, height: 60 },
            },
            back: {
                printZone: { x: 266, y: 210, width: 228, height: 250 },
                designZone: { x: 268, y: 126, width: 218, height: 392 },
                logoZone: { x: 246, y: 228, width: 60, height: 60 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 300, y: 223, width: 164, height: 136 },
                    designZone: { x: 276, y: 126, width: 202, height: 384 },
                    logoZone: { x: 286, y: 206, width: 40, height: 40 },
                },
            },
        },
    },

    "Veste Classic": {
        productType: "veste",
        availableColors: ["white", "black", "red"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 260, y: 228, width: 238, height: 170 },
                designZone: { x: 266, y: 122, width: 220, height: 394 },
                logoZone: { x: 244, y: 222, width: 60, height: 60 },
            },
            back: {
                printZone: { x: 264, y: 206, width: 230, height: 246 },
                designZone: { x: 266, y: 120, width: 218, height: 388 },
                logoZone: { x: 244, y: 222, width: 60, height: 60 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 296, y: 220, width: 170, height: 138 },
                    designZone: { x: 272, y: 120, width: 208, height: 384 },
                    logoZone: { x: 284, y: 204, width: 40, height: 40 },
                },
            },
        },
    },

    "Veste Coupe-Vent": {
        productType: "veste",
        availableColors: ["green", "blue", "cyan"],
        templates: DEFAULT_TEMPLATES,
        views: {
            front: {
                printZone: { x: 264, y: 226, width: 234, height: 168 },
                designZone: { x: 270, y: 120, width: 216, height: 388 },
                logoZone: { x: 246, y: 220, width: 60, height: 60 },
            },
            back: {
                printZone: { x: 266, y: 206, width: 228, height: 244 },
                designZone: { x: 270, y: 120, width: 214, height: 384 },
                logoZone: { x: 246, y: 220, width: 60, height: 60 },
            },
        },
        templateOverrides: {
            "clean-front-template": {
                front: {
                    printZone: { x: 298, y: 220, width: 166, height: 136 },
                    designZone: { x: 276, y: 120, width: 204, height: 380 },
                    logoZone: { x: 286, y: 204, width: 40, height: 40 },
                },
            },
        },
    },
};

export function getProductCustomizerBaseConfig(product) {
    if (!product?.is_customizable) return null;
    return CONFIGS_BY_PRODUCT_NAME[product?.name] || null;
}

export function getProductCustomizerConfig(product) {
    return getProductCustomizerBaseConfig(product);
}

export function getProductCustomizerViewConfig(product, view = "front", templateId = null) {
    const baseConfig = getProductCustomizerBaseConfig(product);
    if (!baseConfig) return null;

    const safeView = view === "back" ? "back" : "front";
    const baseViewConfig = baseConfig?.views?.[safeView] || null;
    const templateViewOverride =
        templateId && baseConfig?.templateOverrides?.[templateId]?.[safeView]
            ? baseConfig.templateOverrides[templateId][safeView]
            : null;

    if (!baseViewConfig) return null;

    return {
        ...baseViewConfig,
        ...(templateViewOverride || {}),
    };
}

export function getProductCustomizerAvailableColors(product) {
    const config = getProductCustomizerBaseConfig(product);
    return config?.availableColors || [];
}

export function getProductCustomizerTemplates(product) {
    const config = getProductCustomizerBaseConfig(product);
    return config?.templates || DEFAULT_TEMPLATES;
}

export function isProductSupportedByCustomizer(product) {
    return Boolean(getProductCustomizerBaseConfig(product));
}

export { CONFIGS_BY_PRODUCT_NAME as PRODUCT_CUSTOMIZER_CONFIGS };