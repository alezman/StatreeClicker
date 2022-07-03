var layoutInfo = {
    startTab: "none",
    startNavTab: "tree-tab",
	showTree: true,

    treeLayout: ""

    
}


// A "ghost" layer which offsets other layers in the tree
addNode("blank", {
    layerShown: "ghost",
}, 
)

/*
addLayer("tree-tab", {
    tabFormat: [["tree", function() {return (layoutInfo.treeLayout ? layoutInfo.treeLayout : TREE_LAYERS)}]],
    previousTab: "",
    leftTab: true,
}) 
*/


addLayer("tree-tab", {
    tabFormat: {
        "Main": {
            embedLayer() {return 'p'},
        },
        "Upgrades": {
            embedLayer() {return 'p2'},
        },
        "Prestige": {
            embedLayer() {return 'p3'},
        },
    },
    previousTab: "",
    leftTab: true,
})