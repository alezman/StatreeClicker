addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        population: new Decimal(0),
        timer1: 0,
        timer2: 0,
    }},
    color: "#FFFFFF",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "nation fund(s)", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat:[
        "main-display",
        "clickables",
        "blank",
        "buyables",
        "blank",
        ["display-text", () => {return "You have a population of " + formatWhole(player.p.population) + " people, which is being <br>taxed " + format(tmp.p.clickProd.a) + " points every second, giving it to your state." }],
    ],
    clickProd() {
        let x = new Decimal(1)
        x = x.mul(buyableEffect('p',11))
        x = x.mul(getBuyableAmount('p',13).add(1))
        x = x.sub(buyableEffect('p2',22).y)
        let y = x.div(100)
        y = y.mul(buyableEffect('p2',21).x)
        let z = x.sub(y)
        let a = player.p.population.add(1).log(1.3).pow(0.76)
        a = a.pow(buyableEffect('p2',12).x)
        return {
            x: x,
            y: y,
            z: z,
            a: a,
        }
    },
    clickables: {
        11: {
            title: "Steal",
            display() {
                return "Throughout the ancient power of coding, steal nation funds and transfer it to current points, however you'll lose 20% in the act.<br>(Has a 50% of failing)"
            },
            canClick() {
                return player.p.points.gt(0)
            },
            onClick() {
                if (Math.random() >= 0.51) {
                    player.points = player.points.add(player.p.points.mul(0.8))
                    player.p.points = new Decimal(0)
                }
                else player.p.points = new Decimal(0)
            },
            style: {
                "height": "100px",
                "width": "133.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.clickables[11].canClick) return "red"},
            }
        },
        12: {
            title: "Work",
            display() {
                return "Throughout the modern power of coding, add +" + format(tmp.p.clickProd.x) + " point(s) to your current amount.<br>However, 1% of your point gain will be taxed for " + format(tmp.p.clickProd.y) + " point(s)."
            },
            canClick() {
                return true
            },
            onClick() {
                player.points = player.points.add(tmp.p.clickProd.z)
                if (player.p.timer1 > 0) addPoints('p', tmp.p.clickProd.z)
                else addPoints('p', tmp.p.clickProd.y)
            },
            style: {
                "height": "150px",
                "width": "200px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.clickables[12].canClick) return "#4BDC13"}
            }
        },
        13: {
            title: "Donate",
            display() {
                return "Throughout the future power of coding, give up all your points to taxes."
            },
            canClick() {
                return player.points.gt(0)
            },
            onClick() {
                addPoints('p', player.points)
                player.points = new Decimal(0)
            },
            style: {
                "height": "100px",
                "width": "133.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.clickables[13].canClick) return "cyan"},
            }
        },
    },
    buyables: {
        11: {
            title: "Extra Hours",
            display() {
                return "Work more hours than you usually do to earn more points per payment.<br>You work " + formatWhole(getBuyableAmount('p',11)) + " more hour(s) than you do normally.<br>You need to spend " + format(tmp.p.buyables[11].cost.a) + " points and " + format(tmp.p.buyables[11].cost.b) + " nation funds.<br>Your extra work makes you get paid " + format(buyableEffect('p',11).mul(100).sub(100)) + "% more."
            },
            cost(x) {
                let a = x.add(1).mul(10).add(1).pow(1.3)
                let b = x.add(1).mul(3).add(1).pow(1.45)
                a = a.div(buyableEffect('p2',23).y)
                b = b.div(buyableEffect('p2',23).y)
                return {
                    a:a,
                    b:b,
                }
            },
            canAfford() {
                return player.points.gte(tmp.p.buyables[11].cost.a) && player.p.points.gte(tmp.p.buyables[11].cost.b)
            },
            buy() {
                player.points = player.points.sub(tmp.p.buyables[11].cost.a)
                player.p.points = player.p.points.sub(tmp.p.buyables[11].cost.b)
                setBuyableAmount('p', 11, getBuyableAmount('p',11).add(2))
            },
            effect() {
                let x = getBuyableAmount('p',11).add(1).log(1.5).pow(1.5).add(1)
                x = x.mul(buyableEffect('p2',23).x)
                return x
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.buyables[11].canAfford) return "orange"},
            }
        },
        12: {
            title: "Teamwork",
            display() {
                return "Work with your friends to tax people!<br>While the timer is running, you will make as much nation funds as you make points normally.<br>You have " + formatTime(player.p.timer1) + " of time left.<br>It costs 5,000 normal points and 500 nation funds to cast this spell."
            },
            cost() {
                let x = new Decimal(5000)
                let y = new Decimal(500)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                if (player.points.gte(tmp.p.buyables[12].cost.x) && player.p.points.gte(tmp.p.buyables[12].cost.y) && player.p.timer1 == 0) return true
                else return false
            },
            buy() {
                let x = 10
                x = new Decimal(x).sub(buyableEffect('p',11).y)
                x = new Decimal(x).add(buyableEffect('p2',22).x)
                player.points = player.points.sub(5000)
                player.p.points = player.p.points.sub(500)
                player.p.timer1 = x
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.buyables[12].canAfford) return "blue"},
            }
        },
        13: {
            title: "Attack!",
            display() {
                if (getBuyableAmount('p',13).gte(2) || getBuyableAmount('p',13).eq(0))return "Send 100 people to war and have them conquer cities! (5m cooldown)<br>Time Left: " + formatTime(player.p.timer2) + "<br>Each city that you own will give you a +x1 multiplier on each work journey you do. There's a maximum of 100 cities to conquer, and you've conquered "+ formatWhole(getBuyableAmount('p',13)) +" cities so far."
                return "Send 100 people to war and have them conquer cities! (5m cooldown)<br>Time Left: " + formatTime(player.p.timer2) + "<br>Each city that you own will give you a +x1 multiplier on each work journey you do. There's a maximum of 100 cities to conquer, and you've conquered "+ formatWhole(getBuyableAmount('p',13)) +" city so far."
            },
            canAfford() {
                if (player.p.population.gte(100) && player.p.timer2 == 0) return true
            },
            buy() {
                player.p.population = player.p.population.sub(100)
                setBuyableAmount('p', 13, getBuyableAmount('p',13).add(1))
                player.p.timer2 = 300
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p.buyables[13].canAfford) return "green"},
            }
        },
    },
    update(diff) {
        let x = new Decimal(1)
        let z = new Decimal(100)
        x = x.add(buyableEffect('p2',11).x)
        x = x.sub(buyableEffect('p2',12).y)
        x = x.sub(buyableEffect('p2',21).y)
        z = z.add(buyableEffect('p2',11).x.mul(100))
        z = z.sub(buyableEffect('p2',12).y.mul(100))
        z = z.sub(buyableEffect('p2',21).y.mul(100))
        let y = player.p.population.div(z).max(1)
        
        if (player.p.timer1 > 0) Math.max(player.p.timer1 = player.p.timer1 - diff, 0)
        if (player.p.timer2 > 0) Math.max(player.p.timer2 = player.p.timer2 - diff, 0)
        if (player.p.timer1 < 0) player.p.timer1 = 0
        if (player.p.timer2 < 0) player.p.timer2 = 0
        if (player.p.total.gte(10) && getBuyableAmount('p2',13).eq(0)) player.p.population = player.p.population.add(new Decimal(x).mul(diff))
        if (player.p.total.gte(10) && getBuyableAmount('p2',13).gte(1)) player.p.population = player.p.population.add(new Decimal(y).mul(diff))
        player.points = player.points.add(tmp.p.clickProd.a.mul(diff))
    }
})

addLayer("p2", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    tabFormat:[
        ["row", [["buyable", 11], "blank", "blank", ["buyable",12], "blank", "blank", ["buyable",13]]],
        "blank",
        ["row", [["buyable", 21], "blank", "blank", ["buyable",22], "blank", "blank", ["buyable",23]]]

    ],
    buyables: {
        11: {
            title: "Population",
            display() {
                return "Attracts more people to your state.<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " points.<br>Effect 1: +" + format(buyableEffect('p2',11).x) + " to population gain.<br>Effect 2: -" + format(buyableEffect('p2',11).y) + " less Teamwork time.<br>You've signed this contract " + formatWhole(getBuyableAmount('p2',11)) + " times."
            },
            cost(x) {
                let y = new Decimal(1000).pow(new Decimal(1).add(x.div(7.5)))
                return y
            },
            effect() {
                let x = new Decimal(2).mul(getBuyableAmount('p2',11))
                let y = getBuyableAmount('p2',11).div(10)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[11].canAfford) return "purple"},
            }
        },
        12: {
            title: "Tax",
            display() {
                return "Makes people pay more collectively.<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " points.<br>Effect 1: ^" + format(buyableEffect('p2',this.id).x) + " to tax gain.<br>Effect 2: -" + format(buyableEffect('p2',this.id).y) + " less population gain.<br>You've signed this contract " + formatWhole(getBuyableAmount('p2',12)) + " times."
            },
            cost(x) {
                let y = new Decimal(1000).pow(new Decimal(1).add(x.div(7.5)))
                return y
            },
            effect() {
                let x = getBuyableAmount('p2',12).add(1).log(10).pow(1.2).add(1)
                let y = getBuyableAmount('p2',12).div(10)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[12].canAfford) return "purple"},
            }
        },
        13: {
            title: "Attractive State",
            display() {
                return "Makes people pay more collectively.<br>Cost: 100,000 points, 100,000 nation funds, and 250 population.<br>Population gain is now 1% of current population instead of 1/sec."
            },
            cost() {
                let y = new Decimal(100000)
                let x = new Decimal(100000)
                let z = new Decimal(250)
                return {
                    y:y,
                    x:x,
                    z:z,
                }
            },
            canAfford() {
                if (player.points.gte(tmp[this.layer].buyables[this.id].cost.y) && player.p.points.gte(tmp[this.layer].buyables[this.id].cost.x) && player.p.population.gte(tmp[this.layer].buyables[this.id].cost.z)) return true
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost.y)
                player.p.points = player.p.points.sub(100000)
                player.p.population = player.p.population.sub(250)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[13].canAfford && getBuyableAmount('p2',13).eq(0)) return "purple"},
            },
            purchaseLimit() { return new Decimal(1) }
        },
        21: {
            title: "Nation Funds",
            display() {
                return "You get more nation funds per Work without taxing more points.<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " points.<br>Effect 1: x" + format(buyableEffect('p2',this.id).x) + " to tax gain.<br>Effect 2: -" + format(buyableEffect('p2',this.id).y) + " less population gain.<br>You've signed this contract " + formatWhole(getBuyableAmount('p2',this.id)) + " times."
            },
            cost(x) {
                let y = new Decimal(1000).pow(new Decimal(1).add(x.div(5)))
                return y
            },
            effect() {
                let x = getBuyableAmount('p2',21).add(1).log(3).pow(1.2).add(1)
                let y = getBuyableAmount('p2',21).div(10)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[21].canAfford) return "purple"},
            }
        },
        22: {
            title: "depressed bones",
            display() {
                return "Teamwork lasts more.<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " points.<br>Effect 1: +" + formatWhole(buyableEffect('p2',this.id).x) + " teamwork second(s).<br>Effect 2: -" + format(buyableEffect('p2',this.id).y) + " less work gain.<br>You've signed this contract " + formatWhole(getBuyableAmount('p2',this.id)) + " times."
            },
            cost(x) {
                let y = new Decimal(1000).pow(new Decimal(1).add(x.div(5)))
                return y
            },
            effect() {
                let x = getBuyableAmount('p2',22)
                let y = getBuyableAmount('p2',22).mul(5)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[22].canAfford) return "purple"},
            }
        },
        23: {
            title: "Work²",
            display() {
                return "'Extra Hours' misc upgrade is improved.<br>Cost: " + format(tmp[this.layer].buyables[this.id].cost) + " points.<br>Effect 1: x" + format(buyableEffect('p2',this.id).x) + " better work formula(s).<br>Effect 2: /" + format(buyableEffect('p2',this.id).y) + " 'Extra Hours' upgrade cost.<br>You've signed this contract " + formatWhole(getBuyableAmount('p2',this.id)) + " times."
            },
            cost(x) {
                let y = new Decimal(1000).pow(new Decimal(1).add(x.div(5)))
                return y
            },
            effect() {
                let x = getBuyableAmount('p2',23).add(1).log(50).pow(0.75).add(1)
                let y = getBuyableAmount('p2',23).add(1).log(100).pow(0.65).add(1)
                return {
                    x:x,
                    y:y
                }
            },
            canAfford() {
                return player.points.gte(tmp[this.layer].buyables[this.id].cost)
            },
            buy() {
                player.points = player.points.sub(tmp[this.layer].buyables[this.id].cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            style: {
                "height": "150px",
                "width": "200.333333px",
                "border-radius": "2.5%",
                "background-color": function() {if (tmp.p2.buyables[23].canAfford) return "purple"},
            }
        },
    }
}) 
