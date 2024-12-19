const mainDiv = document.getElementById('mainDiv');
const mainCanvas = document.getElementById('mainCanvas');
const shopItems = document.getElementById('shopDiv');
const shopOptions = shopItems.children;
const ctx = mainCanvas.getContext('2d');

// variables and settings
// settings
const settings = {
    minMouseMove: 50,
    poisonLinger: 10000,
    explosionLinger: 1500,
    minHordRange: 5,
    gridRes: 5,
    refreshRate: 10,
    dropHearSize: [50, 50],
    bulletSpeed: -5,
    currentLevel: 0,
    currentWave: 0,
    timeBeforeNextWave: 2500,
    maxTimeBeforeNextWave: 18000,
    startPosition: [250, 250],
    hasShownTransition: false,
    waveDisplayTime: 250,
};

function inBounds(x, y) {
    if (x < 0) {
        x = 0;
    };
    if (x > mainCanvas.width) {
        x = mainCanvas.width;
    };
    if (y < 0) {
        y = 0;
    };
    if (y > mainCanvas.height) {
        y = mainCanvas.height;
    };
    return ([x, y]);
};

function lineIntersects(x1, y1, x2, y2, xMin, yMin, xMax, yMax) {
    // Helper to find intersection of two segments
    function segmentIntersection(p1, p2, q1, q2) {
        const A1 = p2[1] - p1[1];
        const B1 = p1[0] - p2[0];
        const C1 = A1 * p1[0] + B1 * p1[1];

        const A2 = q2[1] - q1[1];
        const B2 = q1[0] - q2[0];
        const C2 = A2 * q1[0] + B2 * q1[1];

        const determinant = A1 * B2 - A2 * B1;

        if (Math.abs(determinant) < 1e-9) {
            // Lines are parallel or collinear
            return false;
        };

        const intersectX = (B2 * C1 - B1 * C2) / determinant;
        const intersectY = (A1 * C2 - A2 * C1) / determinant;

        // Check if the intersection point is within both segments
        if (
            Math.min(p1[0], p2[0]) <= intersectX && intersectX <= Math.max(p1[0], p2[0]) &&
            Math.min(p1[1], p2[1]) <= intersectY && intersectY <= Math.max(p1[1], p2[1]) &&
            Math.min(q1[0], q2[0]) <= intersectX && intersectX <= Math.max(q1[0], q2[0]) &&
            Math.min(q1[1], q2[1]) <= intersectY && intersectY <= Math.max(q1[1], q2[1])
        ) {
            return true;
        };

        return false;
    };

    // Check the four edges of the rectangle
    const rectEdges = [
        [[xMin, yMin], [xMin, yMax]], // Left edge
        [[xMin, yMax], [xMax, yMax]], // Bottom edge
        [[xMax, yMax], [xMax, yMin]], // Right edge
        [[xMax, yMin], [xMin, yMin]]  // Top edge
    ];
    const line = [[x1, y1], [x2, y2]];
    for (const edge of rectEdges) {
        if (segmentIntersection(line[0], line[1], edge[0], edge[1])) {
            return true;
        };
    };
    return false;
};


function getDistance(point1, point2) {
    const dX = (point2.x - point1.x);
    const dY = (point2.y - point1.y);
    const distance = Math.sqrt(dX ** 2 + dY ** 2);
    return ([dX, dY, distance]);
};

function makeImage(url) {
    const image = new Image();
    try {
        image.src = url;
    } catch {
        image.src = 'textures/missing.png';
    };
    return (image);
};

const gameTextures = {
    missingTexture: makeImage('textures/missing.png'),
    titleCard: makeImage('textures/titleCard.png'),
    deathCard: makeImage('textures/deathCard.png'),
    introSlide1: makeImage('textures/slides/introSlide1.png'),
    introSlide2: makeImage('textures/slides/introSlide2.png'),
    introSlide3: makeImage('textures/slides/introSlide3.png'),
    glv1: makeImage('textures/slides/glv1.png'),
    glv2: makeImage('textures/slides/glv2.png'),
    dlv1: makeImage('textures/slides/dlv1.png'),
    dlv2: makeImage('textures/slides/dlv2.png'),
    vlv1: makeImage('textures/slides/vlv1.png'),
    vlv2: makeImage('textures/slides/vlv2.png'),
    clv1: makeImage('textures/slides/clv1.png'),
    blv2: makeImage('textures/slides/blv2.png'),
    blv1: makeImage('textures/slides/blv1.png'),
    dlv2: makeImage('textures/slides/dlv2.png'),
    alv1: makeImage('textures/slides/alv1.png'),
    alv2: makeImage('textures/slides/alv2.png'),
    playerFullHealth: makeImage('textures/players/playerH3.png'),
    playerHalfHealth: makeImage('textures/players/playerH2.png'),
    playerNearDeath: makeImage('textures/players/playerH1.png'),
    goblinFullHealth: makeImage('textures/enemies/goblin/goblin3.png'),
    goblinHalfHealth: makeImage('textures/enemies/goblin/goblin2.png'),
    goblinNearDeath: makeImage('textures/enemies/goblin/goblin1.png'),
    bigGoblinFullHealth: makeImage('textures/enemies/bigGoblin/bigGoblin3.png'),
    bigGoblinHalfHealth: makeImage('textures/enemies/bigGoblin/bigGoblin2.png'),
    bigGoblinNearDeath: makeImage('textures/enemies/bigGoblin/bigGoblin1.png'),
    berserkerGoblinFullHealth: makeImage('textures/enemies/berserkerGoblin/berserkerGoblin3.png'),
    berserkerGoblinHalfHealth: makeImage('textures/enemies/berserkerGoblin/berserkerGoblin2.png'),
    berserkerGoblinNearDeath: makeImage('textures/enemies/berserkerGoblin/berserkerGoblin1.png'),
    archerGoblinFullHealth: makeImage('textures/enemies/archerGoblin/archerGoblin3.png'),
    archerGoblinHalfHealth: makeImage('textures/enemies/archerGoblin/archerGoblin2.png'),
    archerGoblinNearDeath: makeImage('textures/enemies/archerGoblin/archerGoblin1.png'),
    bombGoblinFullHealth: makeImage('textures/enemies/bombGoblin/bombGoblin3.png'),
    bombGoblinHalfHealth: makeImage('textures/enemies/bombGoblin/bombGoblin2.png'),
    bombGoblinNearDeath: makeImage('textures/enemies/bombGoblin/bombGoblin1.png'),
    bombGoblinFullHealthLit: makeImage('textures/enemies/bombGoblin/bombGoblinLit3.png'),
    bombGoblinHalfHealthLit: makeImage('textures/enemies/bombGoblin/bombGoblinLit2.png'),
    bombGoblinNearDeathLit: makeImage('textures/enemies/bombGoblin/bombGoblinLit1.png'),
    biterGoblinFullHealth: makeImage('textures/enemies/biterGoblin/biterGoblin3.png'),
    mirrorGoblinFullHealth: makeImage('textures/enemies/mirrorGoblin/mirrorGoblin3.png'),
    mirrorGoblinHalfHealth: makeImage('textures/enemies/mirrorGoblin/mirrorGoblin2.png'),
    mirrorGoblinNearDeath: makeImage('textures/enemies/mirrorGoblin/mirrorGoblin1.png'),
    ghostGoblinFullHealth: makeImage('textures/enemies/ghostGoblin/ghostGoblin3.png'),
    ghostGoblinHalfHealth: makeImage('textures/enemies/ghostGoblin/ghostGoblin2.png'),
    ghostGoblinNearDeath: makeImage('textures/enemies/ghostGoblin/ghostGoblin1.png'),
    poisonGoblinFullHealth: makeImage('textures/enemies/poisonGoblin/poisonGoblin3.png'),
    poisonGoblinHalfHealth: makeImage('textures/enemies/poisonGoblin/poisonGoblin2.png'),
    poisonGoblinNearDeath: makeImage('textures/enemies/poisonGoblin/poisonGoblin1.png'),
    ninjaGoblinFullHealth: makeImage('textures/enemies/ninjaGoblin/ninjaGoblin3.png'),
    ninjaGoblinHalfHealth: makeImage('textures/enemies/ninjaGoblin/ninjaGoblin2.png'),
    ninjaGoblinNearDeath: makeImage('textures/enemies/ninjaGoblin/ninjaGoblin1.png'),
    skeletonGoblinFullHealth: makeImage('textures/enemies/skeletonGoblin/skeletonGoblin3.png'),
    skeletonGoblinHalfHealth: makeImage('textures/enemies/skeletonGoblin/skeletonGoblin2.png'),
    skeletonGoblinNearDeath: makeImage('textures/enemies/skeletonGoblin/skeletonGoblin1.png'),
    skeletonGoblinDead: makeImage('textures/enemies/skeletonGoblin/skeletonGoblinDead.png'),
    shamanGoblinFullHealth: makeImage('textures/enemies/shamanGoblin/shamanGoblin3.png'),
    shamanGoblinHalfHealth: makeImage('textures/enemies/shamanGoblin/shamanGoblin2.png'),
    shamanGoblinNearDeath: makeImage('textures/enemies/shamanGoblin/shamanGoblin1.png'),
    shamanGoblinFullHealthMagic: makeImage('textures/enemies/shamanGoblin/shamanGoblin3Magic.png'),
    shamanGoblinHalfHealthMagic: makeImage('textures/enemies/shamanGoblin/shamanGoblin2Magic.png'),
    shamanGoblinNearDeathMagic: makeImage('textures/enemies/shamanGoblin/shamanGoblin1Magic.png'),
    aldrinFullHealth: makeImage('textures/enemies/aldrin/aldrin3.png'),
    aldrinHalfHealth: makeImage('textures/enemies/aldrin/aldrin2.png'),
    aldrinNearDeath: makeImage('textures/enemies/aldrin/aldrin1.png'),
    weaponDefaultSword: makeImage('textures/weapons/defaultSword.png'),
    weaponMace: makeImage('textures/weapons/mace.png'),
    weaponKatana: makeImage('textures/weapons/katana.png'),
    weaponBattleAxe: makeImage('textures/weapons/battleAxe.png'),
    weaponWarHammer: makeImage('textures/weapons/warHammer.png'),
    weaponTriblade: makeImage('textures/weapons/triblade.png'),
    weaponSickle: makeImage('textures/weapons/sickle.png'),
    weaponTrident: makeImage('textures/weapons/trident.png'),
    weaponSpear: makeImage('textures/weapons/spear.png'),
    weaponEarlyGoblinSword: makeImage('textures/weapons/earlyGoblinSword.png'),
    weaponCopperSword: makeImage('textures/weapons/copperSword.png'),
    weaponGoldSword: makeImage('textures/weapons/goldSword.png'),
    weaponCobaltSword: makeImage('textures/weapons/cobaltSword.png'),
    weaponGiantSword: makeImage('textures/weapons/giantSword.png'),
    weaponRhodoniteSword: makeImage('textures/weapons/rhodoniteSword.png'),
    weaponAmethystSword: makeImage('textures/weapons/amethystSword.png'),
    weaponSteelSword: makeImage('textures/weapons/steelSword.png'),
    weaponTriSteelSword: makeImage('textures/weapons/triSteelSword.png'),
    weaponEmeraldSword: makeImage('textures/weapons/emeraldSword.png'),
    weaponImprovedFatherSword: makeImage('textures/weapons/improvedFatherSword.png'),
    weaponElfSword: makeImage('textures/weapons/elfSword.png'),
    weaponDiamondSword: makeImage('textures/weapons/diamondSword.png'),
    weaponScythe: makeImage('textures/weapons/scythe.png'),
    weaponCritineSword: makeImage('textures/weapons/critineSword.png'),
    weaponRubySword: makeImage('textures/weapons/rubySword.png'),
    weaponBlackOpalSword: makeImage('textures/weapons/blackOpalSword.png'),
    weaponSpinelSword: makeImage('textures/weapons/SpinelSword.png'),
    weaponGreatSword: makeImage('textures/weapons/greatSword.png'),
    weaponRocketSword: makeImage('textures/weapons/rocketSword.png'),
    weaponDualGoldSword: makeImage('textures/weapons/dualGoldSword.png'),
    weaponGoblinDiamondSword: makeImage('textures/weapons/goblinDiamondSword.png'),
    weaponGoblinEmeraldSword: makeImage('textures/weapons/goblinEmeraldSword.png'),
    weaponLongSword: makeImage('textures/weapons/longSword.png'),
    weaponGoldenLongSword: makeImage('textures/weapons/goldenLongSword.png'),
    weaponSpiritSword: makeImage('textures/weapons/spiritSword.png'),
    weaponFlameSword: makeImage('textures/weapons/flameSword.png'),
    weaponMineralSword: makeImage('textures/weapons/mineralSword.png'),
    weaponRocketMace: makeImage('textures/weapons/rocketMace.png'),
    weaponLongRubySword: makeImage('textures/weapons/longRubySword.png'),
    weaponRubyDiamondSword: makeImage('textures/weapons/rubyDiamondSword.png'),
    weaponMagmaSword: makeImage('textures/weapons/magmaSword.png'),
    weaponLongSteelSword: makeImage('textures/weapons/longSteelSword.png'),
    weaponObsidianSword: makeImage('textures/weapons/obsidianSword.png'),
    weaponYourSword: makeImage('textures/weapons/yourSword.png'),
    weaponYourHammer: makeImage('textures/weapons/yourHammer.png'),
    weaponBow: makeImage('textures/weapons/bow.png'),
    weaponBowFull: makeImage('textures/weapons/bowFull.png'),
    weaponGoldBow: makeImage('textures/weapons/goldBow.png'),
    weaponGoldBowFull: makeImage('textures/weapons/goldBowFull.png'),
    weaponCrossbow: makeImage('textures/weapons/crossbow.png'),
    weaponCrossbowFull: makeImage('textures/weapons/crossbowFull.png'),
    weaponMultiShotBow: makeImage('textures/weapons/multiShotBow.png'),
    weaponMultiShotBowFull: makeImage('textures/weapons/multiShotBowFull.png'),
    weaponSlingShot: makeImage('textures/weapons/slingShot.png'),
    weaponSlingShotFull: makeImage('textures/weapons/slingShotFull.png'),
    weaponBlowDart: makeImage('textures/weapons/blowDart.png'),
    weaponThrowingKnives: makeImage('textures/weapons/throwingKnives.png'),
    weaponBombBow: makeImage('textures/weapons/bombBow.png'),
    weaponBombBowFull: makeImage('textures/weapons/bombBowFull.png'),
    weaponCompactBow: makeImage('textures/weapons/compactBow.png'),
    weaponCompactBowFull: makeImage('textures/weapons/compactBowFull.png'),
    weaponHandCannon: makeImage('textures/weapons/handCannon.png'),
    weaponHandCannonFull: makeImage('textures/weapons/handCannonFull.png'),
    weaponMetalBow: makeImage('textures/weapons/metalBow.png'),
    weaponMetalBowFull: makeImage('textures/weapons/metalBowFull.png'),
    weaponMirror: makeImage('textures/weapons/mirror.png'),
    weaponDiamondBow: makeImage('textures/weapons/diamondBow.png'),
    weaponDiamondBowFull: makeImage('textures/weapons/diamondBowFull.png'),
    weaponClusterBow: makeImage('textures/weapons/clusterBow.png'),
    weaponClusterBowFull: makeImage('textures/weapons/clusterBowFull.png'),
    weaponBoomStick: makeImage('textures/weapons/boomStick.png'),
    weaponBoomStickFull: makeImage('textures/weapons/boomStickFull.png'),
    weaponArrowShooter: makeImage('textures/weapons/arrowShooter.png'),
    weaponArrowShooterFull: makeImage('textures/weapons/arrowShooterFull.png'),
    weaponSoulBow: makeImage('textures/weapons/soulBow.png'),
    weaponSoulBowFull: makeImage('textures/weapons/soulBowFull.png'),
    weaponBoomerang: makeImage('textures/weapons/boomerang.png'),
    weaponPentaShotBow: makeImage('textures/weapons/pentaShotBow.png'),
    weaponPentaShotBowFull: makeImage('textures/weapons/pentaShotBowFull.png'),
    weaponHugeHandCannon: makeImage('textures/weapons/hugeHandCannon.png'),
    weaponHugeHandCannonFull: makeImage('textures/weapons/hugeHandCannonFull.png'),
    weaponTriBombBow: makeImage('textures/weapons/triBombBow.png'),
    weaponTriBombBowFull: makeImage('textures/weapons/triBombBowFull.png'),
    weaponDoubleBoomStick: makeImage('textures/weapons/doubleBoomStick.png'),
    weaponDoubleBoomStickFull: makeImage('textures/weapons/doubleBoomStickFull.png'),
    weaponDualSoulClusterBow: makeImage('textures/weapons/dualSoulClusterBow.png'),
    weaponDualSoulClusterBowFull: makeImage('textures/weapons/dualSoulClusterBowFull.png'),
    weaponUpgradedTriBombShooterBow: makeImage('textures/weapons/upgradedTriBombShooterBow.png'),
    weaponUpgradedTriBombShooterBowFull: makeImage('textures/weapons/upgradedTriBombShooterBowFull.png'),
    weaponAldrinStaff: makeImage('textures/weapons/aldrinStaff.png'),
    bulletArrow: makeImage('textures/weapons/arrow.png'),
    bulletGoldArrow: makeImage('textures/weapons/goldArrow.png'),
    bulletCrossArrow: makeImage('textures/weapons/crossArrow.png'),
    bulletMultiArrow: makeImage('textures/weapons/multiArrow.png'),
    bulletSlingBullet: makeImage('textures/weapons/slingBullet.png'),
    bulletPoisonDart: makeImage('textures/weapons/poisonDart.png'),
    bulletBombArrow: makeImage('textures/weapons/bombArrow.png'),
    bulletCompactArrow: makeImage('textures/weapons/compactArrow.png'),
    bulletCannonBall: makeImage('textures/weapons/cannonBall.png'),
    bulletLight: makeImage('textures/weapons/lightBullet.png'),
    bulletMetalArrow: makeImage('textures/weapons/metalArrow.png'),
    bulletDiamondArrow: makeImage('textures/weapons/diamondArrow.png'),
    bulletClusterArrow: makeImage('textures/weapons/clusterArrow.png'),
    bulletClusterShard: makeImage('textures/weapons/clusterShard.png'),
    bulletBoomStickBullet: makeImage('textures/weapons/boomStickBullet.png'),
    bulletShooterArrow: makeImage('textures/weapons/shooterArrow.png'),
    bulletSoulArrow: makeImage('textures/weapons/soulArrow.png'),
    bulletPentaArrow: makeImage('textures/weapons/pentaArrow.png'),
    bulletHugeCannonBall: makeImage('textures/weapons/hugeCannonBall.png'),
    bulletTriBombArrow: makeImage('textures/weapons/triBombArrow.png'),
    bulletDualSoulClusterArrow: makeImage('textures/weapons/dualSoulClusterArrow.png'),
    bulletUpgradedTriBombShooterArrow: makeImage('textures/weapons/upgradedTriBombShooterArrow.png'),
    bulletAldrinStaffMagic: makeImage('textures/weapons/aldrinStaffMagic.png'),
    heart: makeImage('textures/drops/heart.png'),
    explosion: makeImage('textures/explosion.png'),
    poisonTile: makeImage('textures/poisonTile.png'),
    plainsBackground: makeImage('textures/areas/plainBackground.png'),
    plainsForeground: makeImage('textures/areas/plainForeground.png'),
    forestBackground: makeImage('textures/areas/forestBackground.png'),
    forestForeground: makeImage('textures/areas/forestForeground.png'),
    villageBackground: makeImage('textures/areas/villageBackground.png'),
    villageForeground: makeImage('textures/areas/villageForeground.png'),
    castleBackground: makeImage('textures/areas/castleBackground.png'),
    castleForeground: makeImage('textures/areas/castleForeground.png'),
    warBackground: makeImage('textures/areas/warBackground.png'),
    warForeground: makeImage('textures/areas/warForeground.png'),
    bossCastleBackground: makeImage('textures/areas/bossCastleBackground.png'),
    bossCastleForeground: makeImage('textures/areas/bossCastleForeground.png'),
    shopBackground1: makeImage('textures/shopBackground/background1.png'),
};

class effectExplosion {
    x = 0;
    y = 0;
    sizeX = 200;
    sizeY = 200;
    range = 100;
    damage = 100;
    texture = gameTextures.explosion;
    dead = false;
    activate = function () {

        const enemyLength = currentEnemies.length;
        for (let i = enemyLength - 1; i > -1; i--) {
            const enemy = currentEnemies[i];
            if (enemy && enemy.health > 0) {
                const [dX, dY, distance] = getDistance(this, enemy);
                const trueDistance = distance - (enemy.hitBoxX + enemy.hitBoxY) / 2;
                if (trueDistance <= this.range) {
                    enemy.explode(this.damage);
                };
            };
        };

        // hurts player
        const [dX, dY, distance] = getDistance(this, usePlayerProps);
        const trueDistance = distance - (usePlayerProps.sizeX + usePlayerProps.sizeY) / 2;
        if (trueDistance <= this.range) {
            usePlayerProps.health -= this.damage;
        };

        // destroys arrows
        /*const bulletLength = currentBullets.length;
        for (let i = bulletLength - 1; i > -1; i--) {
            const bullet = currentBullets[i];
            if (bullet && (bullet.constructor.name != 'aldrinStaffMagic' && bullet.constructor.name != 'aldrinStaffHugeMagic' && bullet.constructor.name != 'weaponAldrinStaffFastHuge')) {
                const [dX, dY, distance] = getDistance(this, bullet);
                if (distance == 0) {

                };
                const trueDistance = distance - (bullet.boxSizeX + bullet.boxSizeY) / 2;
                if (distance <= this.range) {
                   // console.log(currentBullets[i])
                    currentBullets.splice(i, 1);
                    // PROBLEM IS HERE!
                };
            };
        };*/

        setTimeout(() => {
            this.dead = true;
        }, settings.explosionLinger);
    };
};

class tilePoison {
    x = 0;
    y = 0;
    sizeX = 150;
    sizeY = 150;
    texture = gameTextures.poisonTile;
    range = 50;
    damage = .1;
    dead = false;
    activate = function () {
        setTimeout(() => {
            this.dead = true;
        }, settings.poisonLinger);
    };
};

let usePlayerProps = null;
const currentBullets = [];
const currentDropItems = [];
const currentEnemies = [];
const currentHords = [];
const currentForegrounds = [];
const currentFloorgrounds = [];

// handles spawning in enemies
function summonEnemy(enemyData) {
    const summonedEnemy = new enemyData[1];
    if (enemyData[2][0]) {
        summonedEnemy.weaponData = new enemyData[2][0];
    };
    if (enemyData[2][1]) {
        summonedEnemy.bowData = new enemyData[2][1];
    };
    summonedEnemy.x = enemyData[3][0];
    summonedEnemy.y = enemyData[3][1];
    currentEnemies.push(summonedEnemy);
};

function getMouseAngle() {
    const dX = usePlayerProps.mouseX - usePlayerProps.x;
    const dY = usePlayerProps.mouseY - usePlayerProps.y;
    return (Math.atan2(dY, dX));
};

// function for calculating weapon position
function getWeaponPosition(x, y, mouseX, mouseY, sizeX, sizeY, offset, attacking) {
    const dX = mouseX - x;
    const dY = mouseY - y;
    const angle = Math.atan2(dY, dX) + Math.PI / 2;
    const offsetX = (-1 * (sizeX / 2));
    const offsetY = (-1 * (sizeY / 2) + (attacking ? offset * (4 / 3) : offset));
    return ([angle, offsetX, offsetY]);
};

class weaponHands {
    swingable = false;
    attackRange = 5;
    damage = 10;
    swingDamge = 0;
    swingWeight = 0;
    attackDuration = 500;
    attackCoolDown = 150;
    canBlock = false;
    blockDuration = 0;
    blockCoolDown = 0;
    texture = null;
    displayName = 'Hands';
    sizeX = 0;
    sizeY = 0;
    offset = 0;
    draw(x, y, angle, offsetX, offsetY, blocking, using, opacity) {
        if (!this.texture || !this.sizeX || !this.sizeY || (using && this.disappearOnUse)) {
            return (false);
        };
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + (blocking ? (Math.PI / 2) : 0));
        ctx.globalAlpha = (opacity ? opacity : 1);
        ctx.drawImage(((!using && this.fullTexture) ? this.fullTexture : this.texture), (blocking ? offsetY * 2 / 3 : offsetX), (blocking ? offsetY/2  : offsetY), this.sizeX, this.sizeY);
        ctx.globalAlpha = 1;
        ctx.restore();
    };
};

class arrow {
    source = null;
    sizeX = 100;
    sizeY = 100;
    boxSizeX = 50;
    boxSizeY = 50;
    useTexture = gameTextures.bulletArrow;
    x = 0;
    y = 0;
    angle = 0;
    damage = 25;
    draw() {
        if (!this.useTexture || !this.sizeX || !this.sizeY) {
            return (false);
        };
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.useTexture, -1 * (this.sizeX / 2), -1 * (this.sizeY / 2), this.sizeX, this.sizeY);
        ctx.restore();
    };
};

class goldArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletGoldArrow;
        this.damage = 50;
    };
};

class crossbowArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletCrossArrow;
        this.damage = 150;
    };
};

class multiArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletMultiArrow;
        this.damage = 15;
    };
};

class slingBullet extends arrow {
    constructor() {
        super();
        this.sizeX = 15;
        this.sizeY = 15;
        this.boxSizeX = 15;
        this.boxSizeY = 15;
        this.useTexture = gameTextures.bulletSlingBullet;
        this.damage = 5;
    };
};

class poisonDart extends arrow {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.boxSizeX = 25;
        this.boxSizeY = 25;
        this.useTexture = gameTextures.bulletPoisonDart;
        this.damage = 10;
    };
    async onImpact(hit) {
        if (hit === usePlayerProps) {
            for (let i = 0; i < 50; i++) {
                await wait(100);
                if (usePlayerProps.health <= 0) {
                    break;
                };
                hit.health -= .5;
            };
        } else {
            hit.movementSpeed = (hit.maxSpeed * 2 / 3);
        };
    };
};

class throwingKinve extends arrow {
    constructor() {
        super();
        this.sizeX = 45;
        this.sizeY = 45;
        this.boxSizeX = 25;
        this.boxSizeY = 25;
        this.useTexture = gameTextures.weaponThrowingKnives;
        this.damage = 25;
        this.rotateAmount = 12.5
        this.rotation = 0;
    };
    draw() {
        if (!this.useTexture || !this.sizeX || !this.sizeY) {
            return (false);
        };
        if ((this.rotation*Math.PI/180) >= (2*Math.PI)) {
            this.rotation = 0;
        } else {
            this.rotation += this.rotateAmount;
        };
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle+(this.rotation*Math.PI/180));
        ctx.drawImage(this.useTexture, -1 * (this.sizeX / 2), -1 * (this.sizeY / 2), this.sizeX, this.sizeY);
        ctx.restore();
    };
};

class bombArrow extends arrow {
    constructor() {
        super();
        this.sizeX = 100;
        this.sizeY = 100;
        this.boxSizeX = 50;
        this.boxSizeY = 50;
        this.useTexture = gameTextures.bulletBombArrow;
        this.damage = 5;
    };
    async onImpact(hit) {
        const effect = new effectExplosion;
        effect.x = this.x;
        effect.y = this.y;
        effect.sizeX = 100;
        effect.sizeY = 100;
        effect.range = 50;
        effect.damage = 50;
        effect.activate();
        currentForegrounds.push(effect);
    }; 
};

class compactArrow extends arrow {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.boxSizeX = 25;
        this.boxSizeY = 25;
        this.useTexture = gameTextures.bulletCompactArrow;
        this.damage = 75;
        this.piercing = true;
    };
};

class cannonBall extends arrow {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.boxSizeX = 50;
        this.boxSizeY = 50;
        this.useTexture = gameTextures.bulletCannonBall;
        this.damage = 250;
        this.piercing = true;
    };
};

class bulletLight extends arrow {
    constructor() {
        super();
        this.sizeX = 10;
        this.sizeY = 10;
        this.boxSizeX = 5;
        this.boxSizeY = 5;
        this.useTexture = gameTextures.bulletLight;
        this.damage = 2.5;
    };
};

class metalArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletMetalArrow;
        this.damage = 35;
    };
};

class diamondArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletDiamondArrow;
        this.damage = 65;
        this.piercing = true;
    };
};

class clusterShard extends arrow {
    constructor() {
        super();
        this.sizeX = 10;
        this.sizeY = 10;
        this.boxSizeX = 10;
        this.boxSizeY = 10;
        this.useTexture = gameTextures.bulletClusterShard;
        this.damage = 10;
    };
};

class clusterArrow extends arrow {
    constructor() {
        super();
        this.shardAmount = 8;
        this.useTexture = gameTextures.bulletClusterArrow;
        this.damage = 10;
    };
    async onImpact(hit) {
        for (let i = 0; i < shardAmount; i++) {
            const shotArrow = new clusterShard;
            shotArrow.source = this.source;
            shotArrow.x = this.x;
            shotArrow.y = this.y;
            shotArrow.angle = this.angle + (i*(45*Math.PI/180));
            currentBullets.push(shotArrow);
        };
    };
};

class boomStickBullet extends arrow {
    constructor() {
        super();
        this.sizeX = 8;
        this.sizeY = 8;
        this.boxSizeX = 16;
        this.boxSizeY = 16;
        this.useTexture = gameTextures.bulletBoomStickBullet;
        this.damage = 15;
    };
};

class shooterArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletShooterArrow;
        this.damage = 25;
    };
};

class soulArrow extends arrow {
    constructor() {
        super();
        this.ticksAfterShot = 0;
        this.ticksBeforeFollow = 35;
        this.useTexture = gameTextures.bulletSoulArrow;
        this.damage = 50;
    };
    onStep() {
        if (this.ticksAfterShot < this.ticksBeforeFollow) {
            this.ticksAfterShot += 1;
        } else {
            const allEnemyDistances = [];
            const currentEnemyLength = currentEnemies.length;
            if (currentEnemyLength <= 0) {
                return;
            };
    
            for (let i = 0; i < currentEnemyLength; i++) {
                const enemy = currentEnemies[i];
                const [dX, dY, distance] = getDistance(this, enemy);
                allEnemyDistances.push([distance, dX, dY]);
            };
    
            let nearestIndex = 0;
            if (currentEnemyLength > 1) {
                for (let i = 0; i < currentEnemyLength; i++) {
                    if (allEnemyDistances[i][0] <= allEnemyDistances[nearestIndex][0]) {
                        nearestIndex = i;
                    };
                };
            };
    
            this.angle = (Math.atan2(allEnemyDistances[nearestIndex][2], allEnemyDistances[nearestIndex][1]) + Math.PI / 2);
        };
    };
};

class bulletBoomerang extends throwingKinve {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.boxSizeX = 25;
        this.boxSizeY = 25;
        this.useTexture = gameTextures.weaponBoomerang;
        this.damage = 150;
        this.piercing = true;
        this.ticksAfterShot = 0;
        this.ticksBeforeReturn = 50;
        this.returning = false;
    };
    onStep() {
        if (!this.returning) {
            this.ticksAfterShot += 1;
            if (this.ticksAfterShot >= this.ticksBeforeReturn) {
                this.returning = true;
                this.angle += Math.PI;
            };
        };
    }
};

class hugeCannonBall extends arrow {
    constructor() {
        super();
        this.sizeX = 100;
        this.sizeY = 100;
        this.boxSizeX = 100;
        this.boxSizeY = 100;
        this.useTexture = gameTextures.bulletHugeCannonBall;
        this.damage = 300;
        this.piercing = true;
    };
};

class pentaArrow extends arrow {
    constructor() {
        super();
        this.useTexture = gameTextures.bulletPentaArrow;
        this.damage = 35;
    };
};

class triBombArrow extends arrow {
    constructor() {
        super();
        this.sizeX = 100;
        this.sizeY = 100;
        this.boxSizeX = 50;
        this.boxSizeY = 50;
        this.useTexture = gameTextures.bulletTriBombArrow;
        this.damage = 5;
    };
    async onImpact(hit) {
        const effect = new effectExplosion;
        effect.x = this.x;
        effect.y = this.y;
        effect.sizeX = 125;
        effect.sizeY = 125;
        effect.range = 63;
        effect.damage = 100;
        effect.activate();
        currentForegrounds.push(effect);
    }; 
};

class dualSoulClusterArrow extends arrow {
    constructor() {
        super();
        this.shardAmount = 8;
        this.ticksAfterShot = 0;
        this.ticksBeforeFollow = 25;
        this.useTexture = gameTextures.bulletDualSoulClusterArrow;
        this.damage = 10;
    };
    onStep() {
        if (this.ticksAfterShot < this.ticksBeforeFollow) {
            this.ticksAfterShot += 1;
        } else {
            const allEnemyDistances = [];
            const currentEnemyLength = currentEnemies.length;
            if (currentEnemyLength <= 0) {
                return;
            };
    
            for (let i = 0; i < currentEnemyLength; i++) {
                const enemy = currentEnemies[i];
                const [dX, dY, distance] = getDistance(this, enemy);
                allEnemyDistances.push([distance, dX, dY]);
            };
    
            let nearestIndex = 0;
            if (currentEnemyLength > 1) {
                for (let i = 0; i < currentEnemyLength; i++) {
                    if (allEnemyDistances[i][0] <= allEnemyDistances[nearestIndex][0]) {
                        nearestIndex = i;
                    };
                };
            };
    
            this.angle = (Math.atan2(allEnemyDistances[nearestIndex][2], allEnemyDistances[nearestIndex][1]) + Math.PI / 2);
        };
    };
    async onImpact(hit) {
        for (let i = 0; i < shardAmount; i++) {
            const shotArrow = new clusterShard;
            shotArrow.source = this.source;
            shotArrow.x = this.x;
            shotArrow.y = this.y;
            shotArrow.angle = this.angle + (i*(45*Math.PI/180));
            currentBullets.push(shotArrow);
        };
    };
};

class aldrinStaffMagic extends throwingKinve {
    constructor() {
        super();
        this.sizeX = 25;
        this.sizeY = 25;
        this.boxSizeX = 12.5;
        this.boxSizeY = 12.5;
        this.useTexture = gameTextures.bulletAldrinStaffMagic;
        this.damage = 200;
        this.rotateAmount = 1.5625
        this.rotation = 0;
    };
};

class aldrinStaffHugeMagic extends throwingKinve {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.boxSizeX = 25;
        this.boxSizeY = 25;
        this.useTexture = gameTextures.bulletAldrinStaffMagic;
        this.damage = 200;
        this.rotateAmount = 1.5625
        this.rotation = 0;
    };
};

class weaponBow extends weaponHands {
    constructor() {
        super();
        this.fireRate = 1000;
        this.useBullet = arrow;
        this.swingable = false;
        this.attackRange = 250;
        this.damage = 0;
        this.swingDamge = 0;
        this.attackDuration = 0;
        this.attackCoolDown = 0;
        this.texture = gameTextures.weaponBow;
        this.fullTexture = gameTextures.weaponBowFull;
        this.displayName = 'Bow';
        this.sizeX = 50;
        this.sizeY = 50;
        this.yOffset = -75;
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const angle = Math.atan2(dY, dX) + Math.PI / 2;
        const shotArrow = new this.useBullet;
        shotArrow.source = source;
        const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
        shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
        shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
        shotArrow.angle = angle;
        currentBullets.push(shotArrow);
    };
};

class weaponCrossbow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 5000;
        this.useBullet = crossbowArrow;
        this.texture = gameTextures.weaponCrossbow;
        this.fullTexture = gameTextures.weaponCrossbowFull;
        this.displayName = 'Crossbow';
    };
};

class weaponGoldBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 750;
        this.useBullet = goldArrow;
        this.texture = gameTextures.weaponGoldBow;
        this.fullTexture = gameTextures.weaponGoldBowFull;
        this.displayName = 'Gold Bow';
    };
};

class weaponMultiShotBow extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 3;
        this.sizeX = 100;
        this.sizeY = 50;
        this.fireRate = 1250;
        this.useBullet = multiArrow;
        this.texture = gameTextures.weaponMultiShotBow;
        this.fullTexture = gameTextures.weaponMultiShotBowFull;
        this.displayName = 'Multi Shot Bow';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/36)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - changeBy;
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponSlingShot extends weaponBow {
    constructor() {
        super();
        this.fireRate = 100;
        this.useBullet = slingBullet;
        this.texture = gameTextures.weaponSlingShot;
        this.fullTexture = gameTextures.weaponSlingShotFull;
        this.displayName = 'Sling Shot';
    };
};

class weaponBlowDart extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1250;
        this.yOffset = -50;
        this.useBullet = poisonDart;
        this.texture = gameTextures.weaponBlowDart;
        this.fullTexture = null;
        this.displayName = 'Poison Dart';
        this.special = 'Deals poision damage';
    };
};

class weaponThrowingKnives extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1250;
        this.useBullet = throwingKinve;
        this.texture = gameTextures.weaponThrowingKnives;
        this.fullTexture = null;
        this.displayName = 'Throwing Knives';
        this.disappearOnUse = true;
    };
};

class weaponBombBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 2000;
        this.useBullet = bombArrow;
        this.texture = gameTextures.weaponBombBow;
        this.fullTexture = gameTextures.weaponBombBowFull;
        this.displayName = 'Bomb Bow';
        this.special = 'Explodes on impact';
    };
};

class weaponCompactBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1500;
        this.useBullet = compactArrow;
        this.texture = gameTextures.weaponCompactBow;
        this.fullTexture = gameTextures.weaponCompactBowFull;
        this.displayName = 'Compact Bow';
    };
};

class weaponHandCannon extends weaponBow {
    constructor() {
        super();
        this.fireRate = 7500;
        this.swingWeight = 10;
        this.useBullet = cannonBall;
        this.texture = gameTextures.weaponHandCannon;
        this.fullTexture = gameTextures.weaponHandCannonFull;
        this.displayName = 'Hand Cannon';
        this.sizeX = 100;
        this.sizeY = 100;
        this.yOffset = -100;
    };
};

class weaponMirror extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 3;
        this.fireRate = 0;
        this.useBullet = bulletLight;
        this.texture = gameTextures.weaponMirror;
        this.fullTexture = null;
        this.displayName = 'Mirror';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        let angle = Math.atan2(dY, dX) + (Math.PI / 2);
        for (let i = 0; i < this.bulletMultiplier; i++) {
            setTimeout(() => {
                const shotArrow = new this.useBullet;
                shotArrow.source = source;
                const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
                shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
                shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
                shotArrow.angle = angle;
                currentBullets.push(shotArrow);
            }, i*25);
        };
    };
};

class weaponMetalBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 875;
        this.useBullet = metalArrow;
        this.texture = gameTextures.weaponMetalBow;
        this.fullTexture = gameTextures.weaponMetalBowFull;
        this.displayName = 'Metal Bow';
    };
};

class weaponDiamondBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 875;
        this.useBullet = diamondArrow;
        this.texture = gameTextures.weaponDiamondBow;
        this.fullTexture = gameTextures.weaponDiamondBowFull;
        this.displayName = 'Diamond Bow';
    };
};

class weaponClusterBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1000;
        this.useBullet = clusterArrow;
        this.texture = gameTextures.weaponClusterBow;
        this.fullTexture = gameTextures.weaponClusterBowFull;
        this.displayName = 'Cluster Bow';
        this.special = 'Shoots shards in all directions';
    };
};

class weaponBoomStick extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 8;
        this.sizeX = 100;
        this.sizeY = 100;
        this.yOffset = -100;
        this.fireRate = 1200;
        this.useBullet = boomStickBullet;
        this.texture = gameTextures.weaponBoomStick;
        this.fullTexture = gameTextures.weaponBoomStickFull;
        this.displayName = 'Boom Stick';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        let angle = Math.atan2(dY, dX) + (Math.PI / 2);
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle + ((Math.floor(Math.random() * 700) - 350) * .0001);
            currentBullets.push(shotArrow);
        };
    };
};

class weaponArrowShooter extends weaponBow {
    constructor() {
        super();
        this.sizeX = 100;
        this.sizeY = 100;
        this.yOffset = -100;
        this.fireRate = 250;
        this.useBullet = shooterArrow;
        this.texture = gameTextures.weaponArrowShooter;
        this.fullTexture = gameTextures.weaponArrowShooterFull;
        this.displayName = 'Arrow Shooter';
    };
};

class weaponSoulBow extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1000;
        this.useBullet = soulArrow;
        this.texture = gameTextures.weaponSoulBow;
        this.fullTexture = gameTextures.weaponSoulBow;
        this.displayName = 'Soul Bow';
        this.special = 'Targets closest enemy';
    };
};

class weaponBoomerang extends weaponBow {
    constructor() {
        super();
        this.fireRate = 1250;
        this.useBullet = bulletBoomerang;
        this.texture = gameTextures.weaponBoomerang;
        this.fullTexture = null;
        this.displayName = 'Boomerang';
        this.disappearOnUse = true;
    };
};

class weaponHugeHandCannon extends weaponBow {
    constructor() {
        super();
        this.fireRate = 5000;
        this.swingWeight = 7;
        this.useBullet = hugeCannonBall;
        this.texture = gameTextures.weaponHugeHandCannon;
        this.fullTexture = gameTextures.weaponHugeHandCannonFull;
        this.displayName = 'Huge Hand Cannon';
        this.sizeX = 125;
        this.sizeY = 125;
        this.yOffset = -125;
    };
};

class weaponPentaShotBow extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 5;
        this.sizeX = 100;
        this.sizeY = 50;
        this.fireRate = 1000;
        this.useBullet = pentaArrow;
        this.texture = gameTextures.weaponPentaShotBow;
        this.fullTexture = gameTextures.weaponPentaShotBowFull;
        this.displayName = 'Penta Shot Bow';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/72)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - (changeBy*2);
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponTriBombBow extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 3;
        this.sizeX = 100;
        this.sizeY = 50;
        this.fireRate = 1500;
        this.useBullet = triBombArrow;
        this.texture = gameTextures.weaponTriBombBow;
        this.fullTexture = gameTextures.weaponTriBombBowFull;
        this.displayName = 'Tri-Bomb Bow';
        this.special = 'Explodes on impact';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/36)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - changeBy;
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponDoubleBoomStick extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 16;
        this.sizeX = 100;
        this.sizeY = 100;
        this.yOffset = -100;
        this.fireRate = 1200;
        this.useBullet = boomStickBullet;
        this.texture = gameTextures.weaponDoubleBoomStick;
        this.fullTexture = gameTextures.weaponDoubleBoomStickFull;
        this.displayName = 'Dual Boom Stick';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        let angle = Math.atan2(dY, dX) + (Math.PI / 2);
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle + ((Math.floor(Math.random() * 1400) - 700) * .0001);
            currentBullets.push(shotArrow);
        };
    };
};

class weaponDualSoulClusterBow extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 2;
        this.sizeX = 200;
        this.sizeY = 100;
        this.yOffset = -100;
        this.fireRate = 1000;
        this.useBullet = dualSoulClusterArrow;
        this.texture = gameTextures.weaponDualSoulClusterBow;
        this.fullTexture = gameTextures.weaponDualSoulClusterBowFull;
        this.displayName = 'Dual Soul Cluster Bow';
        this.special = 'Targets closest enemy & shoots shards in all directions';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/72)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - changeBy;
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy*2;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponUpgradedTriBombShooterBow extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 3;
        this.sizeX = 100;
        this.sizeY = 100;
        this.yOffset = -100;
        this.fireRate = 350;
        this.useBullet = triBombArrow;
        this.texture = gameTextures.weaponUpgradedTriBombShooterBow;
        this.fullTexture = gameTextures.weaponUpgradedTriBombShooterBowFull;
        this.displayName = 'Upgraded Tri-Bomb Shooter';
        this.special = 'Explodes on impact';
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/36)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - changeBy;
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponAldrinStaff extends weaponBow {
    constructor() {
        super();
        this.bulletMultiplier = 3;
        this.sizeX = 75;
        this.sizeY = 75;
        this.yOffset = -150;
        this.fireRate = 750;
        this.useBullet = aldrinStaffMagic;
        this.texture = gameTextures.weaponAldrinStaff;
        this.fullTexture = null;
        this.displayName = "Aldrin's Staff";
    };
    shoot(x1, x2, y1, y2, source, fromCenter) {
        const dX = x2 - x1;
        const dY = y2 - y1;
        const changeBy = (Math.PI/9)
        let angle = Math.atan2(dY, dX) + (Math.PI / 2) - changeBy;
        for (let i = 0; i < this.bulletMultiplier; i++) {
            const shotArrow = new this.useBullet;
            shotArrow.source = source;
            const averageSize = (shotArrow.boxSizeX + shotArrow.boxSizeY) / 2;
            shotArrow.x = x1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.cos(angle - Math.PI / 2));
            shotArrow.y = y1 + (fromCenter ? 0 : (-1 * (this.yOffset) - averageSize) * Math.sin(angle - Math.PI / 2));
            shotArrow.angle = angle;
            angle += changeBy;
            currentBullets.push(shotArrow);
        };
    };
};

class weaponAldrinStaffHuge extends weaponBow {
    constructor() {
        super();
        this.sizeX = 75;
        this.sizeY = 75;
        this.yOffset = -150;
        this.fireRate = 500;
        this.useBullet = aldrinStaffHugeMagic;
        this.texture = gameTextures.weaponAldrinStaff;
        this.fullTexture = null;
        this.displayName = "Aldrin's Staff";
    };
};

class weaponAldrinStaffFastHuge extends weaponAldrinStaffHuge {
    constructor() {
        super();
        this.fireRate = 100;
    };
};

class weaponDefaultSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 80;
        this.damage = 20;
        this.swingDamge = 2.5;
        this.attackDuration = 750;
        this.attackCoolDown = 250;
        this.canBlock = true;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponDefaultSword;
        this.displayName = 'Sword';
        this.sizeX = 50;
        this.sizeY = 50;
        this.offset = -50;
    };
};

class weaponMace extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 65;
        this.damage = 30;
        this.swingDamge = 8.3;
        this.swingWeight = 3;
        this.attackDuration = 500;
        this.attackCoolDown = 1500;
        this.canBlock = true;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponMace;
        this.displayName = 'Mace';
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -50;
    };
};

class weaponKatana extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 100;
        this.damage = 25;
        this.swingDamge = 20;
        this.attackDuration = 500;
        this.attackCoolDown = 600;
        this.canBlock = true;
        this.texture = gameTextures.weaponKatana;
        this.displayName = 'Katana';
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -50;
    };
};

class weaponBattleAxe extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 100;
        this.damage = 10;
        this.swingDamge = 25;
        this.swingWeight = 10;
        this.attackDuration = 1000;
        this.attackCoolDown = 1500;
        this.texture = gameTextures.weaponBattleAxe;
        this.displayName = 'Battle Axe';
        this.sizeX = 75;
        this.sizeY = 100;
        this.offset = -50;
    };
};

class weaponWarHammer extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 100;
        this.damage = 2.5;
        this.swingDamge = 45;
        this.swingWeight = 15;
        this.attackDuration = 1000;
        this.attackCoolDown = 1500;
        this.texture = gameTextures.weaponWarHammer;
        this.displayName = 'War Hammer';
        this.sizeX = 75;
        this.sizeY = 100;
        this.offset = -50;
    };
};

class weaponTriblade extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 75;
        this.damage = 20;
        this.swingDamge = 2.5;
        this.attackDuration = 100;
        this.attackCoolDown = 50;
        this.texture = gameTextures.weaponTriblade;
        this.displayName = 'Tri-Blade';
        this.sizeX = 75;
        this.sizeY = 75;
        this.offset = -25;
    };
};

class weaponSickle extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 75;
        this.damage = 5;
        this.swingDamge = 15;
        this.attackDuration = 300;
        this.attackCoolDown = 200;
        this.canBlock = true;
        this.texture = gameTextures.weaponSickle;
        this.displayName = 'Sickle';
        this.sizeX = 100;
        this.sizeY = 95;
        this.offset = -35;
    };
};

class weaponTrident extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 125;
        this.damage = 75;
        this.swingDamge = 10;
        this.swingWeight = 5;
        this.attackDuration = 700;
        this.attackCoolDown = 850;
        this.texture = gameTextures.weaponTrident;
        this.displayName = 'Trident';
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -65;
    };
};

class weaponSpear extends weaponHands {
    constructor() {
        super();
        this.swingable = false;
        this.attackRange = 125;
        this.damage = 35;
        this.swingDamge = 0;
        this.swingWeight = 0;
        this.attackDuration = 700;
        this.attackCoolDown = 850;
        this.texture = gameTextures.weaponSpear;
        this.displayName = 'Spear';
        this.sizeX = 75;
        this.sizeY = 125;
        this.offset = -65;
    };
};

class weaponEarlyGoblinSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 70;
        this.damage = 15;
        this.swingDamge = 2.5;
        this.attackDuration = 750;
        this.attackCoolDown = 250;
        this.canBlock = true;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponEarlyGoblinSword;
        this.displayName = 'Goblin Sword';
        this.sizeX = 75;
        this.sizeY = 75;
        this.offset = -35;
    };
};

class weaponCopperSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 70;
        this.damage = 25;
        this.swingDamge = 4.5;
        this.attackDuration = 750;
        this.attackCoolDown = 350;
        this.canBlock = true;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponCopperSword;
        this.displayName = 'Copper Sword';
        this.sizeX = 75;
        this.sizeY = 75;
        this.offset = -35;
    };
};

class weaponGoldSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 70;
        this.damage = 35;
        this.swingDamge = 5.5;
        this.attackDuration = 750;
        this.attackCoolDown = 500;
        this.canBlock = true;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponGoldSword;
        this.displayName = 'Gold Sword';
        this.sizeX = 75;
        this.sizeY = 75;
        this.offset = -35;
    };
};

class weaponCobaltSword extends weaponCopperSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponCobaltSword;
        this.displayName = 'Cobalt Sword';
    };
};

class weaponGiantSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 70;
        this.damage = 50;
        this.swingDamge = 45;
        this.attackDuration = 550;
        this.attackCoolDown = 1000;
        this.canBlock = false;
        this.blockDuration = 1000;
        this.blockCoolDown = 500;
        this.texture = gameTextures.weaponGiantSword;
        this.displayName = 'Giant Sword';
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -50;
    };
};

class weaponRhodoniteSword extends weaponCopperSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponRhodoniteSword;
        this.displayName = 'Rhodonite Sword';
    };
};

class weaponAmethystSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponAmethystSword;
        this.displayName = 'Amethyst Sword';
        this.damage = 40;
        this.swingDamge = 6.5;
        this.attackCoolDown = 600;
    };
};

class weaponSteelSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponSteelSword;
        this.displayName = 'Steel Sword';
        this.attackRange = 70;
        this.damage = 30;
        this.swingDamge = 4.5;
        this.attackDuration = 600;
        this.attackCoolDown = 400;
    };
};

class weaponTriSteelSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponTriSteelSword;
        this.displayName = 'Steel Tri-Sword';
        this.attackRange = 75;
        this.attackDuration = 650;
        this.attackCoolDown = 550;
    };
};

class weaponEmeraldSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponEmeraldSword;
        this.displayName = 'Emerald Sword';
        this.attackRange = 70;
        this.damage = 50;
        this.swingDamge = 7.5;
        this.attackDuration = 850;
        this.attackCoolDown = 1000;
    };
};

class weaponImprovedFatherSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = false;
        this.attackRange = 110;
        this.damage = 75;
        this.swingDamge = 15;
        this.swingWeight = 8;
        this.attackDuration = 700;
        this.attackCoolDown = 650;
        this.texture = gameTextures.weaponImprovedFatherSword;
        this.displayName = "Improved Father's Sword";
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -65;
    };
};

class weaponElfSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 50;
        this.damage = 65;
        this.swingDamge = 5;
        this.swingWeight = 2;
        this.attackDuration = 700;
        this.attackCoolDown = 750;
        this.texture = gameTextures.weaponElfSword;
        this.displayName = 'Elf Sword';
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -35;
    };
};

class weaponDiamondSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 100;
        this.damage = 95;
        this.swingDamge = 15;
        this.swingWeight = 8;
        this.attackDuration = 700;
        this.attackCoolDown = 850;
        this.texture = gameTextures.weaponDiamondSword;
        this.displayName = "Diamond Sword";
        this.sizeX = 100;
        this.sizeY = 100;
        this.offset = -55;
    };
};

class weaponScythe extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 200;
        this.damage = 2.5;
        this.swingDamge = 50;
        this.swingWeight = 5;
        this.attackDuration = 500;
        this.attackCoolDown = 500;
        this.texture = gameTextures.weaponScythe;
        this.displayName = 'Scythe';
        this.sizeX = 125;
        this.sizeY = 125;
        this.offset = -55;
    };
};

class weaponCritineSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponCritineSword;
        this.displayName = 'Critine Sword';
        this.attackRange = 85;
        this.damage = 65;
        this.swingDamge = 7.5;
        this.attackDuration = 850;
        this.attackCoolDown = 1000;
    };
};

class weaponRubySword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponRubySword;
        this.displayName = 'Ruby Sword';
        this.attackRange = 100;
        this.damage = 70;
        this.swingDamge = 7.5;
        this.attackDuration = 850;
        this.attackCoolDown = 1250;
    };
};

class weaponBlackOpalSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponBlackOpalSword;
        this.displayName = 'Black Opal Sword';
        this.attackRange = 70;
        this.damage = 65;
        this.swingDamge = 7.5;
        this.attackDuration = 850;
        this.attackCoolDown = 1000;
    };
};

class weaponSpinelSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponSpinelSword;
        this.displayName = 'Spinel Sword';
        this.attackRange = 70;
        this.damage = 65;
        this.swingDamge = 7.5;
        this.attackDuration = 850;
        this.attackCoolDown = 1000;
    };
};

class weaponRocketSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 90;
        this.damage = 75;
        this.swingDamge = 10;
        this.swingWeight = 4;
        this.attackDuration = 500;
        this.attackCoolDown = 250;
        this.texture = gameTextures.weaponRocketSword;
        this.displayName = "Rocket Sword";
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -75;
    };
};

class weaponGreatSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.attackRange = 200;
        this.damage = 0.5;
        this.swingDamge = 75;
        this.swingWeight = 8;
        this.attackDuration = 500;
        this.attackCoolDown = 500;
        this.texture = gameTextures.weaponGreatSword;
        this.displayName = 'Great Sword';
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -100;
    };
};

class weaponDualGoldSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponDualGoldSword;
        this.displayName = 'Dual Gold Sword';
        this.attackRange = 70;
        this.damage = 85;
        this.swingDamge = 12.5;
        this.attackDuration = 800;
        this.attackCoolDown = 1000;
    };
};

class weaponGoblinDiamondSword extends weaponDualGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponGoblinDiamondSword;
        this.displayName = 'Goblin Diamond Sword';
    };
};

class weaponGoblinEmeraldSword extends weaponDualGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponGoblinEmeraldSword;
        this.displayName = 'Goblin Emerald Sword';
    };
};

class weaponLongSword extends weaponDualGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponLongSword;
        this.displayName = 'Long Sword';
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -65;
        this.attackRange = 150;
        this.damage = 75;
        this.swingDamge = 8.5;
        this.attackDuration = 900;
        this.attackCoolDown = 1000;
    };
};

class weaponGoldenLongSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 200;
        this.damage = 25;
        this.swingDamge = 100;
        this.swingWeight = 8;
        this.attackDuration = 900;
        this.attackCoolDown = 850;
        this.texture = gameTextures.weaponGoldenLongSword;
        this.displayName = "Golden Long Sword";
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -100;
    };
};

class weaponSpiritSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 100;
        this.damage = 75;
        this.swingDamge = 15;
        this.swingWeight = 0;
        this.attackDuration = 300;
        this.attackCoolDown = 400;
        this.texture = gameTextures.weaponSpiritSword;
        this.displayName = "Spirit Sword";
        this.sizeX = 100;
        this.sizeY = 100;
        this.offset = -75;
    };
};

class weaponFlameSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = false;
        this.attackRange = 125;
        this.damage = 125;
        this.swingDamge = 75;
        this.swingWeight = 0;
        this.attackDuration = 900;
        this.attackCoolDown = 850;
        this.texture = gameTextures.weaponFlameSword;
        this.displayName = "Flame Sword";
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -85;
    };
};

class weaponMineralSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 95;
        this.damage = 150;
        this.swingDamge = 50;
        this.swingWeight = 0;
        this.attackDuration = 800;
        this.attackCoolDown = 750;
        this.texture = gameTextures.weaponMineralSword;
        this.displayName = "Mineral Sword";
        this.sizeX = 100;
        this.sizeY = 100;
        this.offset = -65;
    };
};

class weaponRocketMace extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 100;
        this.damage = 75;
        this.swingDamge = 75;
        this.swingWeight = 2;
        this.attackDuration = 500;
        this.attackCoolDown = 600;
        this.texture = gameTextures.weaponRocketMace;
        this.displayName = "Rocket Mace";
        this.sizeX = 100;
        this.sizeY = 100;
        this.offset = -75;
    };
};

class weaponLongRubySword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 175;
        this.damage = 200;
        this.swingDamge = 45;
        this.swingWeight = 3;
        this.attackDuration = 600;
        this.attackCoolDown = 600;
        this.texture = gameTextures.weaponLongRubySword;
        this.displayName = "Long Ruby Sword";
        this.sizeX = 100;
        this.sizeY = 200;
        this.offset = -75;
    };
};

class weaponRubyDiamondSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponRubyDiamondSword;
        this.displayName = 'Ruby Diamond Sword';
        this.attackRange = 75;
        this.damage = 100;
        this.swingDamge = 15;
        this.attackDuration = 800;
        this.attackCoolDown = 1000;
    };
};

class weaponMagmaSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponMagmaSword;
        this.displayName = 'Magma Sword';
        this.attackRange = 75;
        this.damage = 125;
        this.swingDamge = 20;
        this.attackDuration = 800;
        this.attackCoolDown = 1000;
    };
};

class weaponLongSteelSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponLongSteelSword;
        this.displayName = 'Long Steel Sword';
        this.attackRange = 100;
        this.damage = 100;
        this.swingDamge = 20;
        this.attackDuration = 800;
        this.attackCoolDown = 1000;
        this.offset = -75;
    };
};

class weaponObsidianSword extends weaponGoldSword {
    constructor() {
        super();
        this.texture = gameTextures.weaponObsidianSword;
        this.displayName = 'Obsidian Sword';
        this.attackRange = 75;
        this.damage = 105;
        this.swingDamge = 20;
        this.attackDuration = 800;
        this.attackCoolDown = 1000;
    };
};

class weaponYourSword extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 175;
        this.damage = 200;
        this.swingDamge = 100;
        this.swingWeight = 0;
        this.attackDuration = 700;
        this.attackCoolDown = 650;
        this.texture = gameTextures.weaponYourSword;
        this.displayName = "Your Sword";
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -65;
    };
};

class weaponYourHammer extends weaponHands {
    constructor() {
        super();
        this.swingable = true;
        this.canBlock = true;
        this.attackRange = 175;
        this.damage = 100;
        this.swingDamge = 200;
        this.swingWeight = 0;
        this.attackDuration = 700;
        this.attackCoolDown = 750;
        this.texture = gameTextures.weaponYourHammer;
        this.displayName = "Your Hammer";
        this.sizeX = 50;
        this.sizeY = 100;
        this.offset = -65;
    };
};

class playerProps {
    // texture stuff
    useTexture = null;
    fullHealth = gameTextures.playerFullHealth;
    halfHealth = gameTextures.playerHalfHealth;
    nearDeath = gameTextures.playerNearDeath;
    sizeX = 25;
    sizeY = 25;
    draw(x, y) {
        ctx.drawImage(this.useTexture, x - this.sizeX / 2, y - this.sizeY / 2, this.sizeX, this.sizeY);
    };
    maxHealth = 100;
    health = 100;
    getUseTexture() {
        if (this.health > 66) {
            this.useTexture = this.fullHealth;
        } else if (this.health <= 66 && this.health > 33) {
            this.useTexture = this.halfHealth;
        } else {
            this.useTexture = this.nearDeath;
        };
    };
    // movment stuff
    playerMovmentAmount = 2.5;
    x = settings.startPosition[0];
    y = settings.startPosition[1];
    velocityX = 0;
    velocityY = 0;
    keyMovment = {
        w: 0,
        a: 0,
        s: 0,
        d: 0,
    };
    bites = 0;
    movementHistory = [];
    mouseHistory = [];
    getCurrentWeapon() {
        return((this.currentWeapon == 'sword') ? this.weaponData : this.bowData);
    };
    getWeaponAngle() {
        const useTool = this.getCurrentWeapon();
        if (!useTool.swingWeight) {
            return(getMouseAngle() + Math.PI/2);
        };

        const mouseHistoryLength = this.mouseHistory.length;
        if ((mouseHistoryLength) < 49 && ((mouseHistoryLength-1) - useTool.swingWeight) < 0) {
            return(this.mouseHistory[0]);
        } else {
            return(this.mouseHistory[Math.floor((mouseHistoryLength-1) - useTool.swingWeight)]);
        };

    };
    updateXY() {
        const notBiten = (this.bites <= 0);
        const newX = this.x + (this.keyMovment.d - this.keyMovment.a) * this.playerMovmentAmount;
        const newY = this.y + (this.keyMovment.s - this.keyMovment.w) * this.playerMovmentAmount;
        if (notBiten) {
            if (newX >= 0 && newX <= mainCanvas.width) {
                this.x = newX
            };
            if (newY >= 0 && newY <= mainCanvas.height) {
                this.y = newY
            };
        }
        this.movementHistory.push((notBiten ? [this.x, this.y] : [newX, newY]));
        if (this.movementHistory.length >= 50) {
            this.movementHistory.splice(0, 1);
        };
    };
    // sword stuff
    amountMouseMoved = 0;
    mouseX = 0;
    mouseY = 0;
    isSwinging = false;
    canAttack = true;
    attacking = false;
    initialAttackAngle = 0;
    canBlock = true;
    blocking = false;
    isShooting = false;
    canShoot = true;
    shooting = false;
    currentWeapon = 'sword';
    weaponData = new weaponDefaultSword;
    bowData = new weaponBow;
};

function fillMap(sources, sSX, sSY, pathMap) {
    const enemyLength = currentEnemies.length;
    for (let i = 0; i < enemyLength; i++) {
        const enemy = currentEnemies[i];
        if (!sources.includes(enemy)) {
            const nearestX = Math.round(enemy.x / settings.gridRes) * settings.gridRes;
            const nearestY = Math.round(enemy.y / settings.gridRes) * settings.gridRes;
            const nearestHitBoxX = Math.round(((enemy.hitBoxX / 2) + (sSX / 2)) / settings.gridRes) * settings.gridRes;
            const nearestHitBoxY = Math.round(((enemy.hitBoxY / 2) + (sSY / 2)) / settings.gridRes) * settings.gridRes;

            const minX = nearestX - nearestHitBoxX;
            const minY = nearestY - nearestHitBoxY;
            const maxX = nearestX + nearestHitBoxX;
            const maxY = nearestY + nearestHitBoxY;
            for (let x = minX; x < maxX; x += settings.gridRes) {
                if (x >= 0 && x <= mainCanvas.width) {
                    for (let y = minY; y < maxY; y += settings.gridRes) {
                        if (y >= 0 && y <= mainCanvas.height) {
                            pathMap.get(x)[y] = {
                                x: x,
                                y: y,
                                f: 0,
                                g: 0,
                                h: 0,
                                walkAble: false,
                                parent: null,
                            };
                        };
                    };
                };
            };
        };
    };

    for (let x = 0; x < mainCanvas.width + settings.gridRes; x += settings.gridRes) {
        if (Object.entries(pathMap.get(x)).length <= 100) {
            for (let y = 0; y < mainCanvas.height + settings.gridRes; y += settings.gridRes) {
                if (!pathMap.get(x)[y]) {
                    pathMap.get(x)[y] = {
                        x: x,
                        y: y,
                        f: 0,
                        g: 0,
                        h: 0,
                        walkAble: true,
                        parent: null,
                    };
                };
            };
        };
    };
};

function heuristic(pos0, pos1) {
    return (Math.abs(pos1.x - pos0.x) + Math.abs(pos1.y - pos0.y));
};

function getNeighbors(x, y, pathMap) {
    const neighbors = [];
    if (pathMap.get(x)[y + settings.gridRes]) { // up
        const entry = pathMap.get(x)[y + settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x + settings.gridRes)) { // north east
        const entry = pathMap.get(x + settings.gridRes)[y + settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x + settings.gridRes)) { // right
        const entry = pathMap.get(x + settings.gridRes)[y];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x + settings.gridRes)) { // south east
        const entry = pathMap.get(x + settings.gridRes)[y - settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x)[y - settings.gridRes]) { // down
        const entry = pathMap.get(x)[y - settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x - settings.gridRes)) { // south west
        const entry = pathMap.get(x - settings.gridRes)[y - settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x - settings.gridRes)) { // left
        const entry = pathMap.get(x - settings.gridRes)[y];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    if (pathMap.get(x - settings.gridRes)) { // north west
        const entry = pathMap.get(x - settings.gridRes)[y + settings.gridRes];
        if (entry && entry.walkAble) {
            neighbors.push(entry);
        };
    };
    return (neighbors);
};

function makePath(start, end, maxIterations, pathMap) {
    const path = [];
    const openSet = [start];
    const closedSet = [];
    let iterations = 0;
    while (openSet.length > 0) {
        iterations += 1;
        if (iterations > maxIterations) {
            break;
        };
        let lowestIndex = 0;
        const openLength = openSet.length;
        for (let i = 0; i < openLength; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) {
                lowestIndex = i;
            };
        };

        let currentPoint = openSet[lowestIndex];
        if (currentPoint === end) {
            let temp = currentPoint;
            path.push(temp);
            while (temp.parent) {
                path.push(temp.parent);
                temp = temp.parent;
            };
            return (path.reverse());
        };

        openSet.splice(lowestIndex, 1);
        closedSet.push(currentPoint);

        const neighbors = getNeighbors(currentPoint.x, currentPoint.y, pathMap);
        const totalNeighbors = neighbors.length;
        for (let i = 0; i < totalNeighbors; i++) {
            const neighbor = neighbors[i];

            if (!closedSet.includes(neighbor)) {
                const possibleG = currentPoint.g + 1;

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (possibleG >= neighbor.g) {
                    continue;
                };

                neighbor.g = possibleG;
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = currentPoint;
            };
        };
    };

    return ([]); // no path
};

function handlePathing(source) {
    const [eX, eY] = inBounds(Math.round(source.x / settings.gridRes) * settings.gridRes, Math.round(source.y / settings.gridRes) * settings.gridRes);
    const [pX, pY] = inBounds(Math.round(usePlayerProps.x / settings.gridRes) * settings.gridRes, Math.round(usePlayerProps.y / settings.gridRes) * settings.gridRes);
    const maxIterations = Math.round(Math.sqrt((pX - eX) ** 2 + (pY - eY) ** 2) * 1.5);

    if (maxIterations <= 25) {
        return ([]);
    };

    const pathMap = new Map();
    for (let mapX = 0; mapX < mainCanvas.width + settings.gridRes; mapX += settings.gridRes) {
        pathMap.set(mapX, {});
    };

    fillMap([source], source.hitBoxX, source.hitBoxY, pathMap);

    const start = pathMap.get(eX)[eY];
    const end = pathMap.get(pX)[pY];
    const path = makePath(start, end, maxIterations, pathMap);
    if (path[0]) {
        path.splice(0, 1);
    };


    return (path);
};

function getMyHord(source) {
    const hordLength = currentHords.length;
    for (let i = 0; i < hordLength; i++) {
        const hord = currentHords[i];
        if (hord.members.includes(source)) {
            return (hord);
        }
    };
    return (false);
};

class goblin {
    // texture stuff
    useTexture = null;
    fullHealth = gameTextures.goblinFullHealth;
    halfHealth = gameTextures.goblinHalfHealth;
    nearDeath = gameTextures.goblinNearDeath;
    hitBoxX = 25;
    hitBoxY = 25;
    sizeX = 25;
    sizeY = 25;
    exploded = false;
    exploding = false;
    explosionRange = 0;
    died = false;
    die(noDrops) {
        if (this.died) {
            return;
        };
        this.died = true;
        if (!noDrops) {
            const heart = new heartItem(this.x, this.y);
            currentDropItems.push(heart);
        };
        const enemyLength = currentEnemies.length;
        for (let i = 0; i < enemyLength; i++) {
            if (currentEnemies[i] === this) {
                currentEnemies.splice(i, 1);
            };
        };
    };

    explode(damage) {
        if (this.health > 0) {
            this.health -= damage;
            if (this.constructor.name == 'bombGoblin' && !this.exploded) {
                this.exploded = true;
                this.exploding = true;
                this.makeExplosion();
            };

            if (this.health <= 0) {
                this.die(true);
            };
        } else {
            this.die(true);
        };
    };
    draw(x, y) {
        ctx.globalAlpha = (this.opacity ? this.opacity : 1);
        ctx.drawImage(this.useTexture, x - this.sizeX / 2, y - this.sizeY / 2, this.sizeX, this.sizeY);
        ctx.globalAlpha = 1;
    };
    starterHealth = 100;
    health = 100;
    getUseTexture() {
        if (this.health > this.starterHealth * 2 / 3) {
            this.useTexture = this.fullHealth;
        } else if (this.health <= this.starterHealth * 2 / 3 && this.health > this.starterHealth * 1 / 3) {
            this.useTexture = this.halfHealth;
        } else {
            this.useTexture = this.nearDeath;
        };
    };
    // general stuff
    x = 0;
    y = 0;
    // weapon suff
    wasSwingAttacked = false;
    wasAttacked = false;
    canAttack = true;
    attacking = false;
    canShoot = true;
    shooting = false;
    attackRangeMultiplier = 1;
    attackDamageMultiplier = 1;
    attackCDDivisor = 1;
    currentWeapon = 'sword';
    weaponData = new weaponHands;
    bowData = null;
    adjustmentSpeed = 25;
    minAdjustSpeed = 10;
    // movment/tick stuff
    maxSpeed = 1.5;
    movementSpeed = 1.5;
    checkTick = [0, 10000];
    swingAttackClock = [0, 10];
    path = [];
    moving = false;

    move(dX, dY, distance) {
        const nX = dX / distance;
        const nY = dY / distance;
        this.x += nX * this.movementSpeed;
        this.y += nY * this.movementSpeed;
        const averageHitBox = (this.hitBoxX + this.hitBoxY) / 2;

        const enemyLength = currentEnemies.length;
        for (let i = 0; i < enemyLength; i++) {
            const enemy = currentEnemies[i];
            if (enemy != this) {
                const enemyDifX = enemy.x - this.x;
                const enemyDifY = enemy.y - this.y;
                const enemyDist = Math.sqrt(enemyDifX ** 2 + enemyDifY ** 2);
                const averageEnemyHitBox = (enemy.hitBoxX + enemy.hitBoxY) / 2;
                if (enemyDist <= averageHitBox + averageEnemyHitBox) {
                    const strength = (enemyDist > averageHitBox ? 0 : -1 * (averageHitBox - enemyDist) / averageHitBox);
                    if (averageHitBox > averageEnemyHitBox) { // If you are bigger you push them
                        enemy.x += -1 * strength * enemyDifX;
                        enemy.y += -1 * strength * enemyDifY;
                    } else {
                        this.x += strength * enemyDifX;
                        this.y += strength * enemyDifY;
                    };
                };
            };
        };
        const [pDX, pDY, playerDistance] = getDistance(usePlayerProps, this);
        const averagePlayerHitBox = (usePlayerProps.sizeX + usePlayerProps.sizeY) / 2;
        if (playerDistance <= averageHitBox + averagePlayerHitBox) {
            const strength = (playerDistance > averageHitBox ? 0 : -1 * (averageHitBox - playerDistance) / averageHitBox);
            this.x += strength * pDX;
            this.y += strength * pDY;
        };
    };

    handleMovment() {
        const endPos = [0, 0];
        const hord = getMyHord(this);
        if (hord) {
            if (hord.path[0]) {
                endPos[0] = this.x + (hord.path[0].x - hord.x);
                endPos[1] = this.y + (hord.path[0].y - hord.y);
            } else {
                endPos[0] = usePlayerProps.x;
                endPos[1] = usePlayerProps.y;
            };
        } else {
            this.path = handlePathing(this);
            if (this.path[0]) {
                endPos[0] = this.path[0].x;
                endPos[1] = this.path[1].y;
            } else {
                endPos[0] = usePlayerProps.x;
                endPos[1] = usePlayerProps.y;
            };
        };
        const dX = endPos[0] - this.x;
        const dY = endPos[1] - this.y;
        const distance = Math.sqrt(dX ** 2 + dY ** 2);
        this.move(dX, dY, distance);
    };

    checkIfCanAttack() {
        const [dX, dY, distance] = getDistance(usePlayerProps, this);
        const trueDistance = distance - (this.hitBoxX + this.hitBoxY)/2;
        const ratio = (trueDistance/((mainCanvas.width + mainCanvas.height)/8));
        const proximity = Math.round(((ratio < 0) ? 0 : ((ratio >= 1) ? 1 : ratio)) * 1000) / 1000;
        
        const useAdjustmentSpeed = ((this.currentWeapon == 'sword') ? (this.adjustmentSpeed) : Math.floor(this.adjustmentSpeed/2));
        const moveLength = (usePlayerProps.movementHistory.length + 1);
        const adjustDiff = (moveLength - useAdjustmentSpeed);
        const speed = ((proximity >= 1) ? adjustDiff : ((proximity < 0) ? moveLength : Math.floor(adjustDiff + ((1-proximity) * useAdjustmentSpeed))) - this.minAdjustSpeed);
        let useSpeed = ((speed > (moveLength - this.minAdjustSpeed)) ? (moveLength - this.minAdjustSpeed) : speed);

        if (useSpeed < 0) {
            useSpeed *= -1;
        };
        const pDX = (usePlayerProps.movementHistory[useSpeed][0] - this.x);
        const pDY = (usePlayerProps.movementHistory[useSpeed][1] - this.y);
        const pastAttackAngle = Math.atan2(pDY, pDX);

        const aDX = (usePlayerProps.x - usePlayerProps.movementHistory[useSpeed][0]); // a stands for another because I can't be bothered to give it a unique name
        const aDY = (usePlayerProps.y - usePlayerProps.movementHistory[useSpeed][1]);
        const aDistance = Math.sqrt(aDX ** 2 + aDY ** 2);

        return([(aDistance <= 50), pastAttackAngle]);
    };

    attack() {
        if (this.canAttack) {
            const [couldAttack, pastAttackAngle] = this.checkIfCanAttack();
            if (!couldAttack) {
                return;
            };
            this.canAttack = false;
            this.attacking = true;
            if (usePlayerProps.blocking) {
                const playerAngle = usePlayerProps.getWeaponAngle();
                const difference = Math.abs(playerAngle - (pastAttackAngle+(Math.PI/2)));
                if (difference < (29 * Math.PI / 36) || difference > (43 * Math.PI / 36)) {
                    usePlayerProps.health -= this.weaponData.damage * this.attackDamageMultiplier;
                };
            } else {
                usePlayerProps.health -= this.weaponData.damage * this.attackDamageMultiplier;
            }
            setTimeout(() => {
                this.attacking = false;
                setTimeout(() => {
                    this.canAttack = true;
                }, this.weaponData.attackCoolDown*this.attackCDDivisor);
            }, this.weaponData.attackDuration);
        };
    };

    shoot(fromCenter) {
        if (this.canShoot) {
            const [couldAttack, pastAttackAngle] = this.checkIfCanAttack();
            if (!couldAttack) {
                return;
            };
            this.canShoot = false;
            this.shooting = true;
            this.bowData.shoot(this.x, usePlayerProps.x, this.y, usePlayerProps.y, 'enemy', fromCenter);
            setTimeout(() => {
                this.canShoot = true;
                this.shooting = false;
            }, this.bowData.fireRate);
        };
    };

    criticalTickAction() {
        this.checkTick[0] += 1;
        const [dX, dY, distance] = getDistance(usePlayerProps, this);
        const trueDistance = distance - (this.hitBoxX + this.hitBoxY) / 2;

        // swing tick stuff
        if (this.checkTick[0] >= this.checkTick[1]) {
            this.checkTick[0] = 0;
        };
        if (this.wasSwingAttacked) {
            this.swingAttackClock[0] += 1;
            if (this.swingAttackClock[0] >= this.swingAttackClock[1]) {
                this.swingAttackClock[0] = 0;
                this.wasSwingAttacked = false;
            };
        };

        return (trueDistance);
    }

    tickAction() {
        const trueDistance = this.criticalTickAction();

        // action stuff
        if (this.weaponData && (trueDistance <= this.weaponData.attackRange * this.attackRangeMultiplier * 5 / 3)) {
            this.currentWeapon = 'sword';
            if (trueDistance > this.weaponData.attackRange * this.attackRangeMultiplier) {
                this.moving = true;
                this.handleMovment();
            } else {
                this.moving = false;
                this.attack();
            };
        } else if (this.bowData && (trueDistance <= this.bowData.attackRange * 5 / 3)) {
            if (trueDistance > this.bowData.attackRange) {
                this.moving = true;
                this.handleMovment();
            } else {
                this.moving = false;
            };
            this.currentWeapon = 'bow';
            this.shoot();
        } else {
            this.moving = true;
            this.handleMovment();
        };
    };
};

class aldrin extends goblin {
    constructor() {
        super();
        this.hitBoxX = 50;
        this.hitBoxY = 50;
        this.sizeX = 200;
        this.sizeY = 200;
        this.fullHealth = gameTextures.aldrinFullHealth;
        this.halfHealth = gameTextures.aldrinHalfHealth;
        this.nearDeath = gameTextures.aldrinNearDeath;
        this.starterHealth = 2//30000; // 10,000
        this.health = 2//30000;
        this.currentWeapon = 'sword';
        this.weaponData = new weaponHands;
        this.bowData = null;

        this.shootFromCenter = false;
        this.currentAttack = 0;
        this.allAtacks = [1, 2, 3, 4];
        this.atPosition = false;
        this.attackTick = 0;
        this.possibleAttacks = [
            { // tri magic attack
                moveTo: {
                    x: 250,
                    y: 100
                },
                attackDuration: 1000, // 1 = 10
                attackSetUp: () => {
                    this.currentWeapon = 'bow';
                    this.weaponData = null;
                    this.bowData = new weaponAldrinStaff;
                },
                attackFunction: () => {
                    if (this.attackTick <= 100) {
                        return;
                    };
                    if (this.canShoot) {
                        this.superShoot();
                    };
                },
                attackEnd: () => {
                    this.currentWeapon = 'sword';
                    this.weaponData = new weaponHands;
                    this.bowData = null;
                },
            },
            { // large magic attack
                moveTo: {
                    x: 400,
                    y: 250
                },
                attackDuration: 1000, // 1 = 10
                attackSetUp: () => {
                    this.currentWeapon = 'bow';
                    this.weaponData = null;
                    this.bowData = new weaponAldrinStaffHuge;
                },
                attackFunction: () => {
                    if (this.attackTick <= 100) {
                        return;
                    };
                    if (this.canShoot) {
                        this.superShoot();
                    };
                },
                attackEnd: () => {
                    this.currentWeapon = 'sword';
                    this.weaponData = new weaponHands;
                    this.bowData = null;
                },
            },
            { // summon enemies
                moveTo: {
                    x: 100,
                    y: 250
                },
                attackDuration: 1200, // 1 = 10
                attackSetUp: () => {
                    this.currentWeapon = 'sword';
                    this.weaponData = new weaponHands;
                    this.bowData = null;
                },
                attackFunction: () => {
                    if (this.attackTick < 50 || this.attackTick >= 1000) {
                        return;
                    };
                    if (!(this.attackTick % 100)) {
                        const onX = Math.round(Math.random());
                        const summonX = (onX ? 0 : Math.floor(Math.random()*mainCanvas.width));
                        const summonY = (onX ? Math.floor(Math.random()*mainCanvas.width) : 0);
                        const ran = Math.random();
                        const useWeapon = ((ran > 0.75) ? weaponMagmaSword : ((ran > 0.5) ? weaponLongSteelSword : ((ran > 0.25) ? weaponObsidianSword : weaponRubyDiamondSword)));
                        if (Math.round(Math.random()) == 1) {
                            summonEnemy([null, ghostGoblin, [useWeapon, null], [summonX, summonY]]);
                        } else {
                            summonEnemy([null, skeletonGoblin, [useWeapon, null], [summonX, summonY]]);
                        };
                    };
                },
                attackEnd: () => {
                },
            },
            { // rapid fire
                moveTo: {
                    x: 250,
                    y: 400
                },
                attackDuration: 1500, // 1 = 10
                attackSetUp: () => {
                    this.currentWeapon = 'bow';
                    this.weaponData = null;
                    this.bowData = new weaponAldrinStaffFastHuge;
                },
                attackFunction: () => {
                    if (this.attackTick <= 50) {
                        return;
                    };
                    if ((this.attackTick % 100) <= 30) {
                        return;
                    } else {
                        this.superShoot();
                    };
                },
                attackEnd: () => {
                    this.currentWeapon = 'sword';
                    this.weaponData = new weaponHands;
                    this.bowData = null;
                },
            },
            { // rapid fire from middle
                moveTo: {
                    x: 250,
                    y: 250
                },
                attackDuration: 1000, // 1 = 10
                attackSetUp: () => {
                    this.currentWeapon = 'bow';
                    this.weaponData = null;
                    this.bowData = new weaponAldrinStaffFastHuge;
                    this.adjustmentSpeed = 35;
                    this.minAdjustSpeed = 25;
                },
                attackFunction: () => {
                    if (this.attackTick <= 50) {
                        return;
                    };
                    if ((this.attackTick % 100) <= 30) {
                        return;
                    } else {
                        const [couldAttack, pastAttackAngle] = this.checkIfCanAttack();
                        if (couldAttack) {
                            this.superShoot();
                        } else {
                            if (this.canShoot) {
                                this.canShoot = false;
                                this.shooting = true;
                                this.bowData.shoot(this.x, this.x+5* Math.cos(pastAttackAngle), this.y, this.y+5* Math.sin(pastAttackAngle), 'enemy', this.shootFromCenter);
                                setTimeout(() => {
                                    this.canShoot = true;
                                    this.shooting = false;
                                }, this.bowData.fireRate);
                            };
                        };
                    };
                },
                attackEnd: () => {
                    this.currentWeapon = 'sword';
                    this.weaponData = new weaponHands;
                    this.bowData = null;
                    this.adjustmentSpeed = 25;
                    this.minAdjustSpeed = 10;
                },
            },
        ],
        this.currentAttackInfo = this.possibleAttacks[this.currentAttack];
    };

    superShoot() {
        super.shoot(this.shootFromCenter);
    };

    tickAction() {
        const trueDistance = this.criticalTickAction();
        if (trueDistance <= 20) {
            usePlayerProps.health = 0;
        } else if (trueDistance <= 65) {
            if (this.shooting) {
                usePlayerProps.health = 0;
            };
        } else {
            this.shootFromCenter = false;
        };

        if (!this.atPosition) {
            this.move(this.currentAttackInfo.moveTo);
        } else {
            if (this.attackTick === 0) {
                this.currentAttackInfo.attackSetUp();
            };
            this.attackTick += 1;
            if (this.attackTick >= this.currentAttackInfo.attackDuration) {
                this.currentAttackInfo.attackEnd();

                const ran = Math.round(Math.random() * (this.allAtacks.length-1));
                this.allAtacks.push(this.currentAttack);
                this.currentAttack = this.allAtacks[ran];
                this.currentAttackInfo = this.possibleAttacks[this.currentAttack];
                this.allAtacks.splice(ran, 1);

                this.atPosition = false;
                this.attackTick = 0;
            } else {
                this.currentAttackInfo.attackFunction();
            };
        };
    };

    move(endPos) {
        const [dX, dY, distance] = getDistance(endPos, this);
        const nX = dX / distance;
        const nY = dY / distance;
        this.x -= nX * this.movementSpeed;
        this.y -= nY * this.movementSpeed;
        const [nDX, nDY, newDistance] = getDistance(endPos, this);
        if (newDistance <= 5) {
            this.atPosition = true;
        };
    };
};

class archerGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.archerGoblinFullHealth;
        this.halfHealth = gameTextures.archerGoblinHalfHealth;
        this.nearDeath = gameTextures.archerGoblinNearDeath;
    };
};

class berserkerGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.maxSpeed = 2.5;
        this.movementSpeed = 2.5;
        this.attackDamageMultiplier = 2;
        this.attackCDDivisor = 0.5;
        this.fullHealth = gameTextures.berserkerGoblinFullHealth;
        this.halfHealth = gameTextures.berserkerGoblinHalfHealth;
        this.nearDeath = gameTextures.berserkerGoblinNearDeath;
        this.starterHealth = 75;
        this.health = 75;
    };
};

class bombGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.maxSpeed = 1;
        this.movementSpeed = 1;
        this.fullHealth = gameTextures.bombGoblinFullHealth;
        this.halfHealth = gameTextures.bombGoblinHalfHealth;
        this.nearDeath = gameTextures.bombGoblinNearDeath;
        this.fullHealthLit = gameTextures.bombGoblinFullHealthLit;
        this.halfHealthLit = gameTextures.bombGoblinHalfHealthLit;
        this.nearDeathLit = gameTextures.bombGoblinNearDeathLit;
        this.starterHealth = 100;
        this.health = 100;
        this.explodeIn = 500;
        this.bombRange = 50;
        this.explosionRange = 150;
    };

    makeExplosion() {
        const effect = new effectExplosion;
        effect.x = this.x;
        effect.y = this.y;
        effect.activate();
        currentForegrounds.push(effect);
    };

    tickAction() { // for bomb goblin
        const trueDistance = this.criticalTickAction();
        if (this.exploding) {
            return;
        };

        // action stuff
        if (trueDistance <= this.bombRange) {
            this.exploding = true;
            setTimeout(() => {
                if (this.health > 0) {
                    this.exploded = true;
                    this.makeExplosion();
                };
            }, this.explodeIn);
        } else {
            this.handleMovment();
        };
    };

    getUseTexture() {
        if (this.health > this.starterHealth * 2 / 3) {
            if (this.exploding) {
                this.useTexture = this.fullHealthLit;
            } else {
                this.useTexture = this.fullHealth;
            };
        } else if (this.health <= this.starterHealth * 2 / 3 && this.health > this.starterHealth * 1 / 3) {
            if (this.exploding) {
                this.useTexture = this.halfHealthLit;
            } else {
                this.useTexture = this.halfHealth;
            };
        } else {
            if (this.exploding) {
                this.useTexture = this.nearDeathLit;
            } else {
                this.useTexture = this.nearDeath;
            };
        };
    };
};

class biterGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 20;
        this.sizeY = 20;
        this.hitBoxX = 20;
        this.hitBoxY = 20;
        this.useTexture = gameTextures.biterGoblinFullHealth;
        this.singleTexture = true;
        this.starterHealth = 1;
        this.health = 1;
        this.maxSpeed = 3.5;
        this.movementSpeed = 3.5;
        this.bit = false;
        this.biteDamage = 10;
        this.biteRange = 5;
    };

    tickAction() { // for biter goblin
        const trueDistance = this.criticalTickAction();
        if (this.bit) {
            return;
        };

        // action stuff
        if (trueDistance <= this.biteRange) {
            usePlayerProps.bites += 1;
            usePlayerProps.health -= this.biteDamage;
            this.bit = true
        } else {
            this.handleMovment();
        };
    };

    die(noDrops) {
        if (this.bit) {
            usePlayerProps.bites -= 1;
        };
        super.die(noDrops);
    }
};

class mirrorGoblin extends goblin {
    constructor() {
        super();
        this.maxSpeed = 1;
        this.movementSpeed = 1;
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.mirrorGoblinFullHealth;
        this.halfHealth = gameTextures.mirrorGoblinHalfHealth;
        this.nearDeath = gameTextures.mirrorGoblinNearDeath;
        this.reflectsBullets = true;
    };
};

class ghostGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.ghostGoblinFullHealth;
        this.halfHealth = gameTextures.ghostGoblinHalfHealth;
        this.nearDeath = gameTextures.ghostGoblinNearDeath;
        this.hits = 0;
        this.opacity = 0.5;
    };
    tpAway() {
        const ran = Math.floor(Math.floor(Math.random()*30)/10);
        const newAngle = (ran == 0 ? Math.PI : (ran == 1 ? 3*Math.PI/2 : Math.PI/2));
        const weaponAngle = usePlayerProps.getWeaponAngle() + newAngle;
        const [newX, newY] = inBounds((this.x - (-325 * Math.cos(weaponAngle))), (this.y - (-325 * Math.sin(weaponAngle))));
        this.x = newX;
        this.y = newY;
    };
    getUseTexture() {
        if (this.health > 66) {
            this.useTexture = this.fullHealth;
        } else if (this.health <= 66 && this.health > 33) {
            this.useTexture = this.halfHealth;
            if (!this.hits) {
                this.hits = 1;
                this.tpAway();
            };
        } else {
            this.useTexture = this.nearDeath;
            if (this.hits < 2) {
                this.hits = 2;
                this.tpAway();
            };
        };
    };

    move(dX, dY, distance) {
        const nX = dX / distance;
        const nY = dY / distance;
        this.x += nX * this.movementSpeed;
        this.y += nY * this.movementSpeed;
        const averageHitBox = (this.hitBoxX + this.hitBoxY) / 2;

        const enemyLength = currentEnemies.length;
        for (let i = 0; i < enemyLength; i++) {
            const enemy = currentEnemies[i];
            if (enemy != this && enemy.constructor.name != this.constructor.name) {
                const enemyDifX = enemy.x - this.x;
                const enemyDifY = enemy.y - this.y;
                const enemyDist = Math.sqrt(enemyDifX ** 2 + enemyDifY ** 2);
                const averageEnemyHitBox = (enemy.hitBoxX + enemy.hitBoxY) / 2;
                if (enemyDist <= averageHitBox + averageEnemyHitBox) {
                    const strength = (enemyDist > averageHitBox ? 0 : -1 * (averageHitBox - enemyDist) / averageHitBox);
                    if (averageHitBox > averageEnemyHitBox) { // If you are bigger you push them
                        enemy.x += -1 * strength * enemyDifX;
                        enemy.y += -1 * strength * enemyDifY;
                    } else {
                        this.x += strength * enemyDifX;
                        this.y += strength * enemyDifY;
                    };
                };
            };
        };
        const [pDX, pDY, playerDistance] = getDistance(usePlayerProps, this);
        const averagePlayerHitBox = (usePlayerProps.sizeX + usePlayerProps.sizeY) / 2;
        if (playerDistance <= averageHitBox + averagePlayerHitBox) {
            const strength = (playerDistance > averageHitBox ? 0 : -1 * (averageHitBox - playerDistance) / averageHitBox);
            this.x += strength * pDX;
            this.y += strength * pDY;
        };
    };

    handleMovment() {
        const endPos = [0, 0];
        endPos[0] = usePlayerProps.x;
        endPos[1] = usePlayerProps.y;
        const dX = endPos[0] - this.x;
        const dY = endPos[1] - this.y;
        const distance = Math.sqrt(dX ** 2 + dY ** 2);
        this.move(dX, dY, distance);
    };
};

class poisonGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.poisonGoblinFullHealth;
        this.halfHealth = gameTextures.poisonGoblinHalfHealth;
        this.nearDeath = gameTextures.poisonGoblinNearDeath;
    };

    die(noDrops) {
        const tile = new tilePoison;
        tile.x = this.x;
        tile.y = this.y;
        tile.activate();
        currentFloorgrounds.push(tile);
        super.die(noDrops);
    }
};

class ninjaGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.ninjaGoblinFullHealth;
        this.halfHealth = gameTextures.ninjaGoblinHalfHealth;
        this.nearDeath = gameTextures.ninjaGoblinNearDeath;
    };

    getUseTexture() {
        if (this.health > 66) {
            this.useTexture = this.fullHealth;
            this.opacity = 0.125;
        } else if (this.health <= 66 && this.health > 33) {
            this.useTexture = this.halfHealth;
            this.opacity = 0.45;
        } else {
            this.useTexture = this.nearDeath;
            this.opacity = 1;
        };
    };
};

class skeletonGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.skeletonGoblinFullHealth;
        this.halfHealth = gameTextures.skeletonGoblinHalfHealth;
        this.nearDeath = gameTextures.skeletonGoblinNearDeath;
        this.dead = gameTextures.skeletonGoblinDead;
        this.reviving = false;
        this.reviveTime = 6000;
        this.killCD = false;
    };

    getUseTexture() {
        if (this.health > 66) {
            this.useTexture = this.fullHealth;
        } else if (this.health <= 66 && this.health > 33) {
            this.useTexture = this.halfHealth;
        } else if (!this.reviving) {
            this.useTexture = this.nearDeath;
        } else {
            this.useTexture = this.dead;
        };
    };

    die(noDrops) {
        if (!this.reviving) {
            this.killCD = true
            this.reviving = true;
            setTimeout(() => {
                this.killCD = false
                setTimeout(() => {
                    this.health = 100;
                    this.reviving = false;
                }, this.reviveTime);
            }, 500);
        } else if (!this.killCD) {
            super.die(noDrops);
        };
    };

    tickAction() {
        this.criticalTickAction();

        if (!this.reviving) {
            super.tickAction();
        };
    };
};

class shamanGoblin extends goblin {
    constructor() {
        super();
        this.sizeX = 50;
        this.sizeY = 50;
        this.fullHealth = gameTextures.shamanGoblinFullHealth;
        this.halfHealth = gameTextures.shamanGoblinHalfHealth;
        this.nearDeath = gameTextures.shamanGoblinNearDeath;
        this.fullHealthMagic = gameTextures.shamanGoblinFullHealthMagic;
        this.halfHealthMagic = gameTextures.shamanGoblinHalfHealthMagic;
        this.nearDeathMagic = gameTextures.shamanGoblinNearDeathMagic;
        this.summoning = false;
        this.summonRange = 250;
        this.summoningDuration = 2500;
        this.summonCD = false;
        this.summonCDTime = 5000;
    };

    getUseTexture() {
        if (this.health > 66) {
            if (!this.summoning) {
                this.useTexture = this.fullHealth;
            } else {
                this.useTexture = this.fullHealthMagic;
            };
        } else if (this.health <= 66 && this.health > 33) {
            if (!this.summoning) {
                this.useTexture = this.halfHealth;
            } else {
                this.useTexture = this.halfHealthMagic;
            };
        } else {
            if (!this.summoning) {
                this.useTexture = this.nearDeath;
            } else {
                this.useTexture = this.nearDeathMagic;
            };
        };
    };

    tickAction() { // for shaman goblin
        const trueDistance = this.criticalTickAction();
        if (this.summoning) {
            return;
        };

        // action stuff
        if (trueDistance <= this.summonRange) {
            if (this.summonCD) {
                return;
            };
            this.summoning = true;
            setTimeout(() => {
                if (!this || this.health <= 0) {
                    return;
                };
                this.summoning = false;
                const onX = Math.round(Math.random());
                const summonX = (onX ? 0 : Math.floor(Math.random()*mainCanvas.width));
                const summonY = (onX ? Math.floor(Math.random()*mainCanvas.width) : 0);
                if (Math.round(Math.random()) == 1) {
                    summonEnemy([null, ghostGoblin, [(Math.random() > .5 ? weaponDualGoldSword : weaponGoblinDiamondSword), null], [summonX, summonY]]);
                } else {
                    summonEnemy([null, skeletonGoblin, [(Math.random() > .5 ? weaponLongSword: weaponGoblinEmeraldSword), null], [summonX, summonY]]);
                };
                this.summonCD = true;
                setTimeout(() => {
                    this.summonCD = false;
                }, this.summonCDTime);
            }, this.summoningDuration);
        } else {
            this.handleMovment();
        };
    };
};

class bigGoblin extends goblin {
    constructor() {
        super();
        this.fullHealth = gameTextures.bigGoblinFullHealth;
        this.halfHealth = gameTextures.bigGoblinHalfHealth;
        this.nearDeath = gameTextures.bigGoblinNearDeath;
        this.starterHealth = 200;
        this.health = 200;
        this.hitBoxX = 50;
        this.hitBoxY = 50;
        this.sizeX = 50;
        this.sizeY = 50;
        this.attackDamageMultiplier = 1.5;
        this.maxSpeed = .5;
        this.movementSpeed = .5;
        this.adjustmentSpeed = 35;
        this.minAdjustSpeed = 25;
    };
};

class dropItem {
    useTexture = gameTextures.missingTexture;
    x = 0;
    y = 0;
    sizeX = 0;
    sizeY = 0;
    draw() {
        ctx.drawImage(this.useTexture, this.x - this.sizeX / 2, this.y - this.sizeY / 2, this.sizeX, this.sizeY);
    };
}

class heartItem extends dropItem {
    constructor(x, y) {
        super();
        this.useTexture = gameTextures.heart;
        this.x = x;
        this.y = y;
        this.sizeX = 25;
        this.sizeY = 25;
    };
    pickUp() {
        if (usePlayerProps.health <= 75) {
            usePlayerProps.health += 25;
        } else {
            usePlayerProps.health = 100;
        };
    };
};
// End

const levelData = [ // spawnTick#, enemy, [weaponData, bowData] , [x,y]
    {
        background: gameTextures.plainsBackground,
        foreground: gameTextures.plainsForeground,
        transition: [[gameTextures.introSlide1, 3500], [gameTextures.introSlide2, 5000], [gameTextures.introSlide3, 3500], [gameTextures.glv1, 1000]],
        waves: [[[500, goblin, [null, null], [250, 0]],[700, goblin, [null, null], [0, 250]],],[[200, goblin, [null, null], [250, 500]],[600, goblin, [null, null], [0, 250]],[1000, goblin, [null, null], [250, 0]],[1400, archerGoblin, [null, weaponBow], [500, 250]],],[[200, archerGoblin, [null, weaponBow], [0, 125]],[300, archerGoblin, [null, weaponBow], [0, 875]],[1300, archerGoblin, [null, weaponBow], [500, 125]],[1400, archerGoblin, [null, weaponBow], [500, 875]],],[[200, goblin, [null, null], [0, 0]],[800, archerGoblin, [null, weaponBow], [500, 500]],[1600, goblin, [null, null], [250, 500]],[1800, goblin, [null, null], [250, 0]],[2000, bigGoblin, [null, null], [500, 250]],],],
        shopItems: {weapons: [weaponKatana, weaponSpear], bows: [weaponMetalBow, weaponSlingShot]},
    },
    {
        background: gameTextures.plainsBackground,
        foreground: gameTextures.plainsForeground,
        transition: [[gameTextures.glv2, 1000]],
        waves: [[[200, bigGoblin, [null, null], [250, 500]],[1000, goblin, [null, null], [0, 0]],[1000, archerGoblin, [null, weaponBow], [0, 250]],[1000, goblin, [null, null], [0, 500]],[2000, goblin, [weaponEarlyGoblinSword, null], [0, 0]],],[[200, goblin, [null, null], [0, 250]],[800, archerGoblin, [null, weaponBow], [500, 250]],[800, bigGoblin, [weaponEarlyGoblinSword, null], [500, 150]],[800, goblin, [weaponEarlyGoblinSword, null], [500, 350]],],[[200, goblin, [weaponEarlyGoblinSword, null], [0, 250]],[200, archerGoblin, [null, weaponBow], [500, 250]],[1400, goblin, [weaponEarlyGoblinSword, null], [500, 250]],[1400, archerGoblin, [null, weaponBow], [0, 250]],[2200, berserkerGoblin, [weaponEarlyGoblinSword], [250, 500]],],],
        shopItems: {weapons: [weaponSickle, weaponMace], bows: [weaponMultiShotBow, weaponBlowDart]},
    },
    {
        background: gameTextures.forestBackground,
        foreground: gameTextures.forestForeground,
        transition: [[gameTextures.dlv1, 1000]],
        waves: [[[200, goblin, [weaponCopperSword, null], [0, 0]],[1200, goblin, [weaponGoldSword, null], [0, 0]],[1200, goblin, [weaponRhodoniteSword, null], [500, 500]],[2200, goblin, [weaponGoldSword, null], [0, 0]],[2200, goblin, [weaponCobaltSword, null], [500, 500]],[2200, poisonGoblin, [null, weaponBlowDart], [500, 0]],],[[200, poisonGoblin, [null, null], [0, 0]],[400, poisonGoblin, [null, null], [500, 500]],[600, poisonGoblin, [null, null], [500, 0]],[800, poisonGoblin, [null, weaponBlowDart], [0, 500]],[1600, poisonGoblin, [null, null], [0, 0]],[1800, poisonGoblin, [null, null], [500, 500]],[2000, poisonGoblin, [null, null], [500, 0]],[2200, poisonGoblin, [null, weaponBlowDart], [0, 500]],],[[200, poisonGoblin, [weaponCobaltSword, null], [0, 500]],[200, goblin, [weaponGoldSword, null], [500, 500]],[800, bigGoblin, [weaponGoldSword, null], [250, 500]],[1800, goblin, [weaponCopperSword, null], [0, 500]],[1800, poisonGoblin, [weaponRhodoniteSword, null], [500, 500]],[2400, bigGoblin, [weaponCobaltSword, null], [250, 0]],],],
        shopItems: {weapons: [weaponBattleAxe, weaponTriblade], bows: [weaponGoldBow, weaponCrossbow]},
    },
    {
        background: gameTextures.forestBackground,
        foreground: gameTextures.forestForeground,
        transition: [[gameTextures.dlv2, 1000]],
        waves: [
            [
                [200, goblin, [weaponCopperSword, null], [0, 0]],
                [1200, goblin, [weaponGoldSword, null], [0, 0]],
                [1200, goblin, [weaponRhodoniteSword, null], [500, 500]],
                [2200, goblin, [weaponGoldSword, null], [0, 0]],
                [2200, goblin, [weaponCobaltSword, null], [500, 500]],
                [2200, poisonGoblin, [null, weaponBlowDart], [500, 0]],
            ],
            [
                [200, poisonGoblin, [null, null], [0, 0]],
                [400, poisonGoblin, [null, null], [500, 500]],
                [600, poisonGoblin, [null, null], [500, 0]],
                [800, poisonGoblin, [null, weaponBlowDart], [0, 500]],

                [1600, poisonGoblin, [null, null], [0, 0]],
                [1800, poisonGoblin, [null, null], [500, 500]],
                [2000, poisonGoblin, [null, null], [500, 0]],
                [2200, poisonGoblin, [null, weaponBlowDart], [0, 500]],
            ],
            [
                [200, poisonGoblin, [weaponCobaltSword, null], [0, 500]],
                [200, goblin, [weaponGoldSword, null], [500, 500]],
                [800, bigGoblin, [weaponGoldSword, null], [250, 500]],
                [1800, goblin, [weaponCopperSword, null], [0, 500]],
                [1800, poisonGoblin, [weaponRhodoniteSword, null], [500, 500]],
                [2400, bigGoblin, [weaponCobaltSword, null], [250, 0]],
            ],
        ],
        shopItems: {weapons: [weaponWarHammer, weaponTrident], bows: [weaponBombBow, weaponCompactBow]},
    },
    {
        background: gameTextures.villageBackground,
        foreground: gameTextures.villageForeground,
        transition: [[gameTextures.vlv1, 1000]],
        waves: [
            [
                [200, bigGoblin, [weaponGiantSword, null], [0, 50]],
                [800, goblin, [weaponSteelSword, null], [500, 40]],
                [1000, mirrorGoblin, [weaponTriSteelSword, null], [500, 50]],
                [1200, goblin, [weaponSteelSword, null], [500, 60]],

                [1800, mirrorGoblin, [weaponTriSteelSword, null], [0, 50]],
                [2000, archerGoblin, [null, weaponGoldBow], [150, 500]],
                [2200, archerGoblin, [null, weaponMultiShotBow], [500, 50]],
                [2400, archerGoblin, [null, weaponGoldBow], [350, 500]],
            ],
            [
                [200, bigGoblin, [weaponGiantSword, null], [250, 0]],
                [400, mirrorGoblin, [weaponAmethystSword, null], [150, 500]],
                [400, mirrorGoblin, [weaponEmeraldSword, null], [350, 500]],
                [600, berserkerGoblin, [weaponSteelSword, null], [0, 50]],
                [800, goblin, [weaponSteelSword, null], [500, 50]],
                [1000, goblin, [weaponTriSteelSword, null], [500, 50]],
                [1200, goblin, [weaponEmeraldSword, null], [500, 50]],
                [1400, goblin, [weaponTriSteelSword, null], [500, 50]],
                [1500, ninjaGoblin, [weaponSteelSword, null], [0, 50]],
            ],
            [
                [200, ninjaGoblin, [weaponSteelSword, null], [0, 50]],
                [400, mirrorGoblin, [weaponAmethystSword, null], [500, 50]],
                [600, goblin, [weaponTriSteelSword, null], [0, 50]],
                [800, berserkerGoblin, [weaponEmeraldSword, null], [500, 50]],
                [1000, ninjaGoblin, [weaponSteelSword, null], [0, 50]],
                [1200, goblin, [weaponTriSteelSword, null], [500, 50]],
                [1400, goblin, [weaponSteelSword, null], [0, 50]],
                [1600, mirrorGoblin, [weaponEmeraldSword, null], [500, 50]],
                [1800, berserkerGoblin, [weaponSteelSword, null], [0, 50]],
                [2000, goblin, [weaponAmethystSword, null], [500, 50]],

                [2600, berserkerGoblin, [weaponEmeraldSword, null], [0, 50]],
                [2800, berserkerGoblin, [weaponSteelSword, null], [500, 50]],
                [3000, berserkerGoblin, [weaponTriSteelSword, null], [0, 50]],
                [3200, berserkerGoblin, [weaponAmethystSword, null], [500, 50]],
            ],
        ],
        shopItems: {weapons: [weaponImprovedFatherSword, weaponElfSword], bows: [weaponHandCannon, weaponMirror]},
    },
    {
        background: gameTextures.villageBackground,
        foreground: gameTextures.villageForeground,
        transition: [[gameTextures.vlv2, 1000]],
        waves: [
            [
                [200, goblin, [weaponSteelSword, null], [0, 50]],
                [400, goblin, [weaponSteelSword, null], [250, 0]],
                [600, goblin, [weaponTriSteelSword, null], [500, 50]],
                [800, goblin, [weaponSteelSword, null], [250, 500]],
                [1200, goblin, [weaponTriSteelSword, null], [0, 50]],
                [1400, mirrorGoblin, [weaponSteelSword, null], [0, 50]],
                [1800, goblin, [weaponSteelSword, null], [500, 50]],
                [2000, mirrorGoblin, [weaponTriSteelSword, null], [500, 50]],
                [2200, ninjaGoblin, [weaponEmeraldSword, null], [250, 500]],
                [2400, goblin, [weaponAmethystSword, null], [0, 50]],
                [2600, mirrorGoblin, [weaponTriSteelSword, null], [0, 50]],
                [3000, goblin, [weaponSteelSword, null], [500, 50]],
                [3200, mirrorGoblin, [weaponEmeraldSword, null], [500, 50]],
            ],
            [
                [200, goblin, [weaponSteelSword, null], [225, 0]],
                [200, goblin, [weaponTriSteelSword, null], [250, 0]],
                [800, goblin, [weaponTriSteelSword, null], [200, 0]],
                [800, mirrorGoblin, [weaponEmeraldSword, null], [225, 0]],
                [800, goblin, [weaponSteelSword, null], [250, 0]],
                [800, goblin, [weaponAmethystSword, null], [275, 0]],
                [1600, goblin, [weaponTriSteelSword, null], [100, 0]],
                [1600, goblin, [weaponTriSteelSword, null], [150, 0]],
                [1600, mirrorGoblin, [weaponSteelSword, null], [200, 0]],
                [1600, goblin, [weaponEmeraldSword, null], [250, 0]],
                [1600, goblin, [weaponSteelSword, null], [300, 0]],
                [1600, goblin, [weaponTriSteelSword, null], [350, 0]],
                [2200, bigGoblin, [weaponGiantSword, null], [250, 0]],
            ],
            [
                [200, archerGoblin, [null, weaponBow], [0, 50]],
                [400, archerGoblin, [null, weaponBow], [500, 50]],
                [600, archerGoblin, [null, weaponMultiShotBow], [250, 0]],
                [1000, ninjaGoblin, [weaponEmeraldSword, null], [250, 500]],

                [1600, mirrorGoblin, [weaponAmethystSword, null], [0, 50]],
                [1800, mirrorGoblin, [weaponEmeraldSword, null], [250, 0]],
                [2000, mirrorGoblin, [weaponSteelSword, null], [250, 500]],
                [2200, ninjaGoblin, [weaponTriSteelSword, null], [500, 50]],
            ],
        ],
        shopItems: {weapons: [weaponDiamondSword, weaponScythe], bows: [weaponDiamondBow, weaponClusterBow]},
    },
    {
        background: gameTextures.castleBackground,
        foreground: gameTextures.castleForeground,
        transition: [[gameTextures.clv1, 1000]],
        waves: [
            [
                [200, goblin, [weaponBlackOpalSword, null], [0, 250]],
                [300, goblin, [weaponRubySword, null], [0, 125]],
                [300, goblin, [weaponSpinelSword, null], [0, 250]],
                [300, goblin, [weaponCritineSword, null], [0, 375]],
                [400, biterGoblin, [null, null], [500, 250]],

                [800, goblin, [weaponCritineSword, null], [500, 250]],
                [900, goblin, [weaponRubySword, null], [500, 125]],
                [900, goblin, [weaponBlackOpalSword, null], [500, 250]],
                [900, goblin, [weaponSpinelSword, null], [500, 375]],
                [1000, biterGoblin, [null, null], [0, 250]],
            ],
            [
                [200, goblin, [weaponBlackOpalSword, null], [250, 0]],
                [300, goblin, [weaponRubySword, null], [200, 0]],
                [300, goblin, [weaponSpinelSword, null], [300, 0]],
                [300, goblin, [weaponCritineSword, null], [250, 500]],
                [400, goblin, [weaponRubySword, null], [200, 500]],
                [400, goblin, [weaponBlackOpalSword, null], [300, 500]],
                [500, biterGoblin, [null, null], [0, 250]],
                [600, biterGoblin, [null, null], [500, 250]],
            ],
            [
                [200, archerGoblin, [null, weaponGoldBow], [0, 0]],
                [400, mirrorGoblin, [weaponCritineSword, null], [0, 250]],
                [600, goblin, [weaponRubySword, null], [500, 250]],

                [800, archerGoblin, [null, weaponMultiShotBow], [500, 0]],
                [1000, mirrorGoblin, [weaponBlackOpalSword, null], [500, 250]],
                [1200, biterGoblin, [null, null], [0, 250]],
                
                [1400, archerGoblin, [null, weaponBombBow], [500, 500]],
                [1600, mirrorGoblin, [weaponRubySword, null], [0, 250]],
                [1800, goblin, [weaponBlackOpalSword, null], [500, 250]],
                
                [2000, archerGoblin, [null, weaponCompactBow], [0, 500]],
                [2200, mirrorGoblin, [weaponCritineSword, null], [500, 250]],
                [2400, biterGoblin, [null, null], [0, 250]],
            ],
        ],
        shopItems: {weapons: [weaponRocketSword, weaponGreatSword], bows: [weaponArrowShooter, weaponBoomStick]},
    },
    {
        background: gameTextures.castleBackground,
        foreground: gameTextures.castleForeground,
        transition: [[gameTextures.clv2, 1000]],
        waves: [
            [
                [200, goblin, [weaponBlackOpalSword, null], [0, 250]], 
                [300, berserkerGoblin, [weaponCritineSword, null], [500, 250]], 
                [400, archerGoblin, [null, weaponBombBow], [0, 0]], 
                [500, biterGoblin, [null, null], [250, 500]], 
                [600, archerGoblin, [null, weaponDiamondBow], [500, 500]], 
                [700, berserkerGoblin, [weaponRubySword, null], [250, 0]], 
                [800, goblin, [weaponSpinelSword, null], [250, 500]], 
                [900, biterGoblin, [null, null], [0, 250]], 
                [1000, bombGoblin, [null, null], [500, 250]], 
            ],
            [
                [200, bombGoblin, [null, null], [0, 0]], 
                [200, bombGoblin, [null, null], [0, 250]], 
                [200, bombGoblin, [null, null], [0, 500]], 
                [500, biterGoblin, [null, null], [250, 0]], 
                [500, biterGoblin, [null, null], [250, 500]], 
                [500, goblin, [weaponRubySword, null], [500, 250]],
                [600, bombGoblin, [null, null], [500, 0]], 
                [600, bombGoblin, [null, null], [500, 250]], 
                [600, bombGoblin, [null, null], [500, 500]], 
                [800, biterGoblin, [null, null], [250, 0]], 
                [800, biterGoblin, [null, null], [250, 500]], 
                [800, goblin, [weaponCritineSword, null], [0, 250]],
            ],
            [
                [200, bombGoblin, [null, null], [0, 0]], 
                [300, archerGoblin, [null, weaponCompactBow], [0, 250]], 
                [400, mirrorGoblin, [null, null], [0, 500]], 
                [500, ninjaGoblin, [weaponBlackOpalSword, null], [250, 500]], 
                [600, poisonGoblin, [weaponRubySword, null], [500, 500]], 
                [700, biterGoblin, [null, null], [500, 250]], 
                [800, berserkerGoblin, [weaponCritineSword, null], [500, 0]], 
                [900, goblin, [weaponSpinelSword, null], [250, 0]], 
                [1000, berserkerGoblin, [weaponSpinelSword, null], [0, 0]], 
                [1100, poisonGoblin, [null, weaponBlowDart], [0, 250]], 
                [1200, goblin, [weaponBlackOpalSword, null], [0, 500]], 
                [1300, biterGoblin, [null, null], [250, 500]], 
                [1400, bombGoblin, [null, null], [500, 500]], 
                [1500, poisonGoblin, [weaponRubySword, null], [0, 0]], 
                [1600, biterGoblin, [null, null], [500, 250]], 
                [1700, bigGoblin, [weaponCritineSword, null], [0, 250]], 
                [1800, berserkerGoblin, [weaponRubySword, null], [500, 0]],
                [1900, mirrorGoblin, [weaponBlackOpalSword, null], [0, 500]],  
                [2000, archerGoblin, [null, weaponBombBow], [250, 0]], 
                [2100, archerGoblin, [null, weaponDiamondBow], [250, 500]], 
                [2200, ninjaGoblin, [weaponBlackOpalSword, null], [0, 0]], 
                [2300, poisonGoblin, [weaponRubySword, null], [500, 500]],
                [2400, biterGoblin, [null, null], [500, 250]], 
                [2500, berserkerGoblin, [weaponCritineSword, null], [500, 0]], 
                [2600, goblin, [weaponSpinelSword, null], [250, 0]], 
            ],
        ],
        shopItems: {weapons: [weaponGoldenLongSword, weaponSpiritSword], bows: [weaponSoulBow, weaponBoomerang]},
    },
    {
        background: gameTextures.warBackground,
        foreground: gameTextures.warForeground,
        transition: [[gameTextures.blv1, 1000]],
        waves: [
            [
                [200, goblin, [weaponDualGoldSword, null], [0, 250]], 
                [200, skeletonGoblin, [weaponGoblinDiamondSword, null], [500, 250]], 
                [300, skeletonGoblin, [weaponGoblinEmeraldSword, null], [250, 0]],
                [300, goblin, [weaponLongSword, null], [250, 500]],  
                [800, skeletonGoblin, [null, weaponMetalBow], [0, 0]],  
                [900, goblin, [null, weaponMetalBow], [0, 500]], 
                [1000, skeletonGoblin, [null, weaponMetalBow], [500, 500]], 
                [1100, skeletonGoblin, [null, weaponMetalBow], [500, 0]], 
                [1300, bombGoblin, [null, null], [0, 250]],  
            ],
            [
                [200, goblin, [weaponDualGoldSword, null], [0, 0]], 
                [300, skeletonGoblin, [weaponGoblinDiamondSword, null], [50, 0]], 
                [300, ghostGoblin, [weaponGoblinEmeraldSword, null], [0, 50]], 
                [400, ghostGoblin, [weaponGoblinEmeraldSword, null], [500, 500]], 
                [500, skeletonGoblin, [weaponLongSword, null], [450, 500]], 
                [500, skeletonGoblin, [weaponDualGoldSword, null], [500, 450]], 
                [1000, ghostGoblin, [weaponGoblinEmeraldSword, null], [250, 0]], 
                [1100, ghostGoblin, [weaponDualGoldSword, null], [0, 0]], 
                [1200, ghostGoblin, [weaponGoblinDiamondSword, null], [0, 250]], 
                [1300, ghostGoblin, [weaponLongSword, null], [0, 500]], 
                [1400, ghostGoblin, [weaponGoblinDiamondSword, null], [250, 500]], 
                [1500, ghostGoblin, [weaponGoblinEmeraldSword, null], [500, 500]], 
                [1600, ghostGoblin, [weaponDualGoldSword, null], [500, 250]], 
                [1700, ghostGoblin, [weaponGoblinEmeraldSword, null], [500, 0]], 
            ],
            [
                [200, skeletonGoblin, [weaponDualGoldSword, null], [0, 250]], 
                [250, skeletonGoblin, [weaponLongSword, null], [0, 225]],
                [250, skeletonGoblin, [weaponDualGoldSword, null], [0, 250]],
                [250, skeletonGoblin, [weaponGoblinDiamondSword, null], [0, 275]],
                [300, skeletonGoblin, [weaponLongSword, null], [0, 200]],
                [300, skeletonGoblin, [weaponDualGoldSword, null], [0, 225]],
                [300, skeletonGoblin, [weaponGoblinDiamondSword, null], [0, 250]],
                [300, skeletonGoblin, [weaponGoblinEmeraldSword, null], [0, 275]],
                [300, skeletonGoblin, [weaponLongSword, null], [0, 300]],
                [1000, ghostGoblin, [weaponDualGoldSword, null], [500, 250]], 
                [1050, ghostGoblin, [weaponLongSword, null], [500, 225]],
                [1050, ghostGoblin, [weaponDualGoldSword, null], [500, 250]],
                [1050, ghostGoblin, [weaponGoblinDiamondSword, null], [500, 275]],
                [1100, ghostGoblin, [weaponGoblinEmeraldSword, null], [500, 200]],
                [1100, ghostGoblin, [weaponDualGoldSword, null], [500, 225]],
                [1100, ghostGoblin, [weaponLongSword, null], [500, 250]],
                [1100, ghostGoblin, [weaponGoblinDiamondSword, null], [500, 275]],
                [1100, ghostGoblin, [weaponGoblinEmeraldSword, null], [500, 300]],
            ],
        ],
        shopItems: {weapons: [weaponFlameSword, weaponMineralSword], bows: [weaponHugeHandCannon, weaponPentaShotBow]},
    },
    {
        background: gameTextures.warBackground,
        foreground: gameTextures.warForeground,
        transition: [[gameTextures.blv2, 1000]],
        waves: [
            [
                [200, skeletonGoblin, [weaponDualGoldSword, null], [0, 250]], 
                [250, skeletonGoblin, [weaponGoblinDiamondSword, null], [250, 500]], 
                [300, skeletonGoblin, [weaponLongSword, null], [500, 250]], 
                [350, skeletonGoblin, [weaponGoblinEmeraldSword, null], [250, 0]], 
                [1000, shamanGoblin, [null, null], [0, 0]], 
                [1000, skeletonGoblin, [null, weaponBoomStick], [500, 500]], 
                [1050, archerGoblin, [null, weaponDiamondBow], [500, 0]], 
                [1050, skeletonGoblin, [null, weaponDiamondBow], [0, 500]], 
            ],
            [
                [200, skeletonGoblin, [weaponDualGoldSword, weaponMetalBow], [0, 250]],
                [250, skeletonGoblin, [weaponGoblinEmeraldSword, weaponMetalBow], [500, 250]],
                [325, skeletonGoblin, [weaponLongSword, null], [0, 0]],
                [350, skeletonGoblin, [weaponGoblinDiamondSword, null], [0, 500]],
                [375, goblin, [weaponGoblinDiamondSword, null], [500, 500]],
                [400, skeletonGoblin, [weaponDualGoldSword, null], [500, 0]],
                [1000, skeletonGoblin, [weaponGoblinDiamondSword, null], [0, 50]],
                [1000, ghostGoblin, [weaponDualGoldSword, null], [50, 0]],
                [1100, ghostGoblin, [weaponGoblinEmeraldSword, null], [50, 500]],
                [1100, ghostGoblin, [weaponLongSword, null], [0, 450]],
                [1200, skeletonGoblin, [weaponDualGoldSword, null], [450, 500]],
                [1200, goblin, [weaponGoblinDiamondSword, null], [500, 450]],
                [1300, goblin, [weaponGoblinEmeraldSword, null], [450, 0]],
                [1300, skeletonGoblin, [weaponLongSword, null], [500, 50]],
            ],
            [
                [200, shamanGoblin, [null, null], [0, 0]], 
                [250, shamanGoblin, [null, null], [500, 500]], 
                [300, shamanGoblin, [null, null], [500, 0]], 
                [350, shamanGoblin, [null, null], [0, 500]], 
                [400, shamanGoblin, [null, null], [0, 250]], 
                [450, shamanGoblin, [null, null], [250, 500]], 
                [500, shamanGoblin, [null, null], [500, 250]], 
                [550, shamanGoblin, [null, null], [250, 0]], 
                [750, berserkerGoblin, [weaponDualGoldSword, null], [250, 500]],
            ],
        ],
        shopItems: {weapons: [weaponLongRubySword, weaponRocketMace], bows: [weaponTriBombBow, weaponDoubleBoomStick]},
    },
    {
        background: gameTextures.bossCastleBackground,
        foreground: gameTextures.bossCastleForeground,
        transition: [[gameTextures.alv1, 1000]],
        waves: [
            [
                [200, goblin, [weaponObsidianSword, null], [250, 0]], 
                [250, goblin, [weaponMagmaSword, null], [0, 0]], 
                [250, goblin, [weaponRubyDiamondSword, null], [250, 0]], 
                [250, goblin, [weaponLongSteelSword, null], [500, 0]], 
                [300, bombGoblin, [null, null], [0, 0]], 
                [300, bombGoblin, [null, null], [0, 250]], 
                [300, bombGoblin, [null, null], [0, 500]], 
                [400, archerGoblin, [weaponObsidianSword, weaponDiamondBow], [500, 250]], 
                [550, biterGoblin, [null, null], [250, 500]],
                [600, berserkerGoblin, [weaponMagmaSword, null], [250, 0]], 
            ],
            [
                [200, archerGoblin, [null, weaponMetalBow], [0, 250]], 
                [250, archerGoblin, [null, weaponMetalBow], [0, 200]], 
                [250, archerGoblin, [null, weaponMetalBow], [0, 300]], 
                [300, archerGoblin, [weaponMagmaSword, weaponMetalBow], [0, 350]], 
                [300, archerGoblin, [null, weaponMetalBow], [0, 150]], 
                [350, archerGoblin, [null, weaponMetalBow], [0, 400]],
                [350, archerGoblin, [weaponObsidianSword, weaponMetalBow], [0, 100]],  
                [400, archerGoblin, [null, weaponMetalBow], [0, 450]], 
                [400, archerGoblin, [weaponRubyDiamondSword, weaponMetalBow], [0, 50]], 
                [450, archerGoblin, [null, weaponMetalBow], [0, 500]],
                [450, archerGoblin, [null, weaponMetalBow], [0, 0]],  


                [850, bigGoblin, [weaponMagmaSword, null], [500, 0]], 
                [850, bigGoblin, [weaponRubyDiamondSword, null], [500, 500]], 
                [950, bigGoblin, [weaponObsidianSword, null], [500, 100]], 
                [950, bigGoblin, [weaponMagmaSword, null], [500, 400]], 
                [1050, bigGoblin, [weaponLongSteelSword, null], [500, 200]], 
                [1050, bigGoblin, [weaponObsidianSword, null], [500, 300]], 
            ],
            [
                [200, goblin, [weaponRubyDiamondSword, null], [0, 0]], 
                [250, berserkerGoblin, [weaponMagmaSword, null], [0, 250]], 
                [300, mirrorGoblin, [weaponLongSteelSword, weaponBoomStick], [0, 500]], 
                [350, ghostGoblin, [weaponObsidianSword, null], [250, 500]], 
                [400, archerGoblin, [weaponLongSteelSword, weaponDiamondBow], [500, 500]], 
                [450, poisonGoblin, [weaponMagmaSword, weaponBlowDart], [500, 250]], 
                [500, ninjaGoblin, [weaponRubyDiamondSword, null], [500, 0]], 
                [550, shamanGoblin, [null, null], [250, 0]], 

                [1050, bombGoblin, [null, null], [0, 0]], 
                [1100, ghostGoblin, [weaponRubyDiamondSword, null], [0, 250]], 
                [1150, bigGoblin, [weaponLongSteelSword, null], [0, 500]], 
                [1200, berserkerGoblin, [weaponMagmaSword, null], [250, 500]], 
                [1250, ninjaGoblin, [weaponObsidianSword, null], [500, 500]], 
                [1300, poisonGoblin, [weaponRubyDiamondSword, weaponHandCannon], [500, 250]], 
                [1350, shamanGoblin, [null, null], [500, 0]], 
                [1400, biterGoblin, [null, null], [250, 0]], 
            ],
            [
                [200, goblin, [weaponRubyDiamondSword, null], [0, 0]], 
            ],
        ],
        shopItems: {weapons: [weaponLongRubySword, weaponRocketMace], bows: [weaponTriBombBow, weaponDoubleBoomStick]},
    },
    {
        background: gameTextures.bossCastleBackground,
        foreground: gameTextures.bossCastleForeground,
        transition: [[gameTextures.alv2, 1000]],
        waves: [
            [
                [200, aldrin, [null, null], [250, 0]], 
            ],
        ],
        shopItems: null,
    },
];









// critical functions and setup functions
// wait tick system
function waitTick() {
    return new Promise((success) => {
        setTimeout(() => {
            success();
        }, settings.refreshRate);
    });
};
// End









// game loop

// makes background for title screen
function makeTitleScreenBackground(useImage) {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.beginPath();
    ctx.drawImage(useImage, 0, 0, mainCanvas.width, mainCanvas.height);
    ctx.closePath();
};

// loads on death options
function optionsOnDeath() {
    makeTitleScreenBackground(gameTextures.deathCard);
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.id = 'retryButton';
    mainDiv.appendChild(retryButton);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.id = 'resetButton';
    mainDiv.appendChild(resetButton);

    return new Promise((results) => {
        retryButton.addEventListener('click', function () {
            retryButton.remove();
            resetButton.remove();
            results(true);
        });
        resetButton.addEventListener('click', function () {
            resetButton.textContent = 'Confirm';
            resetButton.style.width = '200px';
            resetButton.style.left = `calc(50% - 100px)`;
            setTimeout(() => {
                resetButton.addEventListener('click', function () {
                    retryButton.remove();
                    resetButton.remove();
                    results(false);
                });
            }, 1000)
        });
    });
}

function handleShop() {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.beginPath();
    ctx.drawImage(gameTextures.shopBackground1, 0, 0);
    ctx.closePath();

    const useShopGear = [levelData[settings.currentLevel - 1].shopItems.weapons[0], levelData[settings.currentLevel - 1].shopItems.weapons[1], levelData[settings.currentLevel - 1].shopItems.bows[0], levelData[settings.currentLevel - 1].shopItems.bows[1]];
    shopItems.style.opacity = 1;
    shopItems.style.zIndex = 10;
    for (let i = 0; i < 4; i++) {
        const useGear = new useShopGear[i];
        useShopGear[i] = useGear;
        let useArrow = null;
        if (i > 1) {
            useArrow = new useGear.useBullet;
        };
        const useShopButton = shopOptions[i + 1];
        const pName = useShopButton.children[0];
        const pDamage = useShopButton.children[1];
        const pSwingDamage = useShopButton.children[2];
        const pRTime = useShopButton.children[3];
        const pRange = useShopButton.children[4];
        pName.textContent = useGear.displayName;
        if (!useArrow) {
            pDamage.textContent = 'Dmg: ' + String(useGear.damage) + 'hp';
            pSwingDamage.textContent = 'Swing Dmg: ' + String(useGear.swingDamge) + 'hp';
            pRTime.textContent = 'Dur: ' + String(useGear.attackDuration / 100) + 'sec | Cd: ' + String(useGear.attackCoolDown / 100) + 'sec';
            pRange.textContent = 'Range: ' + String(useGear.attackRange) + 'px';
        } else {
            pDamage.textContent = 'Dmg: ' + String(useArrow.damage) + 'hp';
            pSwingDamage.textContent = 'Bullets: ' + (useGear.bulletMultiplier ? String(useGear.bulletMultiplier) : '1') + ' | Shrds: ' + (useGear.shardAmount ? String(useGear.shardAmount) : '0');
            pRTime.textContent = 'Cd: ' + String(useGear.fireRate / 1000) + 'sec | Pierce: ' + (useGear.piercing ? useGear.piercing : 'false');
            pRTime.style.fontSize = '17px';
            pRange.textContent = (useGear.special ? useGear.special : '');
            pRange.style.fontSize = '15px';
        };
    };


    return new Promise((results) => {
        const SelectedGear = [null, null];
        for (let i = 0; i < 4; i++) {
            const useGear = useShopGear[i];
            const useShopButton = shopOptions[i + 1];
            const useIndex = ((i < 2) ? 0 : 1);
            let mouseOver = false;
            useShopButton.addEventListener('mouseenter', function () {
                if (SelectedGear[useIndex] != useShopGear[i]) {
                    mouseOver = true;
                    useShopButton.style.backgroundColor = 'rgb(175, 130, 96)';
                    useShopButton.style.border = '2.5px solid rgb(84, 52, 27)';
                };
            });
            useShopButton.addEventListener('mouseleave', function () {
                if (SelectedGear[useIndex] != useShopGear[i]) {
                    mouseOver = false;
                    useShopButton.style.backgroundColor = 'rgb(207, 156, 116)';
                    useShopButton.style.border = '2.5px solid rgb(138, 93, 59)';
                };
            });
            useShopButton.addEventListener('click', function () {
                if (SelectedGear[useIndex] != useShopGear[i]) {
                    const oppIndex = (!(i - (useIndex * 2)) + (useIndex * 2));
                    if (SelectedGear[useIndex] == useShopGear[oppIndex]) {
                        const oppButton = shopOptions[oppIndex + 1];
                        oppButton.style.backgroundColor = 'rgb(207, 156, 116)';
                        oppButton.style.borderColor = 'rgb(84, 52, 27)';
                    };
                    SelectedGear[useIndex] = useGear;
                    useShopButton.style.backgroundColor = 'rgb(90, 59, 36)';
                    useShopButton.style.borderColor = 'rgb(58, 32, 12)';
                } else {
                    SelectedGear[useIndex] = null;
                    if (mouseOver) {
                        useShopButton.style.backgroundColor = 'rgb(175, 130, 96)';
                        useShopButton.style.border = '2.5px solid rgb(84, 52, 27)';
                    } else {
                        useShopButton.style.backgroundColor = 'rgb(207, 156, 116)';
                        useShopButton.style.borderColor = 'rgb(84, 52, 27)';
                    };
                };
            });
        };
        shopOptions[0].addEventListener('click', function () {
            if (SelectedGear[0]) {
                usePlayerProps.weaponData = SelectedGear[0];
            };
            if (SelectedGear[1]) {
                usePlayerProps.bowData = SelectedGear[1];
            };
            shopItems.style.opacity = 0;
            shopItems.style.zIndex = 0;
            for (let i = 0; i < 4; i++) {
                const useShopButton = shopOptions[i + 1];
                useShopButton.style.backgroundColor = 'rgb(207, 156, 116)';
                useShopButton.style.border = '2.5px solid rgb(138, 93, 59)';
            }
            results();
        });
    });
};

// loads main menu
function makeLoadingScreen() {
    makeTitleScreenBackground(gameTextures.titleCard)

    const startButton = document.createElement('button');
    startButton.textContent = 'Play';
    startButton.id = 'playButton';
    mainDiv.appendChild(startButton);

    return new Promise((success) => {
        startButton.addEventListener('click', function () {
            startButton.remove();
            success();
        });
    });
};

// fills mouse movment history with blanks
function fillMouseHistoryWithBlanks() {
    for (let i = 0; i < 50; i++) {
        usePlayerProps.mouseHistory.push[0];
    };
};

// clears data from vital lists
function clearVitalLists() {
    currentEnemies.splice(0, currentEnemies.length);
    currentBullets.splice(0, currentBullets.length);
    currentDropItems.splice(0, currentDropItems.length);
    currentForegrounds.splice(0, currentForegrounds.length);
    currentFloorgrounds.splice(0, currentFloorgrounds.length);
};

// boots up game
function bootGame() {
    settings.hasShownTransition = false;
    settings.hasShownTransition = false;
    settings.currentLevel = 0;
    settings.currentWave = 0;
    amountSummoned = 0;
    stillEnemiesToSummon = true;
    gameClock = 0;
    usePlayerProps = new playerProps();
    clearVitalLists();
    fillMouseHistoryWithBlanks();

    return new Promise((success) => {
        success();
    });
};

// reloads game
function reloadGame() {
    settings.currentWave = 0;
    amountSummoned = 0;
    stillEnemiesToSummon = true;
    gameClock = 0;

    usePlayerProps.x = settings.startPosition[0];
    usePlayerProps.y = settings.startPosition[1];
    usePlayerProps.health = 100;
    usePlayerProps.maxHealth = 100;
    usePlayerProps.velocityX = 0;
    usePlayerProps.velocityY = 0;
    usePlayerProps.keyMovment.w = 0;
    usePlayerProps.keyMovment.a = 0;
    usePlayerProps.keyMovment.s = 0;
    usePlayerProps.keyMovment.d = 0;
    usePlayerProps.amountMouseMoved = 0;
    usePlayerProps.mouseX = 0;
    usePlayerProps.mouseY = 0;
    usePlayerProps.isSwinging = false;
    usePlayerProps.canAttack = true;
    usePlayerProps.attacking = false;
    usePlayerProps.isShooting = false;
    usePlayerProps.canShoot = true;
    usePlayerProps.shooting = false;
    usePlayerProps.currentWeapon = 'sword';
    usePlayerProps.bites = 0;
    usePlayerProps.initialAttackAngle = 0;
    usePlayerProps.movementHistory = [];
    usePlayerProps.mouseHistory = [];
    fillMouseHistoryWithBlanks();

    clearVitalLists();
};

// handles setting key movment
function handleSetKeyMovment(event, setTo) {
    if (event && event.key) {
        switch (String(event.key).toLowerCase()) {
            case ('w'):
                usePlayerProps.keyMovment.w = setTo;
                break;
            case ('a'):
                usePlayerProps.keyMovment.a = setTo;
                break;
            case ('s'):
                usePlayerProps.keyMovment.s = setTo;
                break;
            case ('d'):
                usePlayerProps.keyMovment.d = setTo;
                break;
            case ('1'):
                usePlayerProps.currentWeapon = 'sword';
                break;
            case ('2'):
                usePlayerProps.blocking = false;
                usePlayerProps.currentWeapon = 'bow';
                break;
            default:
                break;
        };
    };
};

// gets key down
function establishUserInputDown(event) {
    handleSetKeyMovment(event, 1);
};

// gets key up
function establishUserInputUp(event) {
    handleSetKeyMovment(event, 0);
};

// gets mouse position
function establishMouseInput(event) {
    const rect = mainCanvas.getBoundingClientRect();
    const distance = Math.sqrt((usePlayerProps.mouseX - (event.clientX - rect.left)) ** 2 + (usePlayerProps.mouseY - (event.clientY - rect.top)) ** 2);
    
    usePlayerProps.amountMouseMoved += distance;
    usePlayerProps.mouseX = event.clientX - rect.left;
    usePlayerProps.mouseY = event.clientY - rect.top;
};

// checks if player is swinging the sword and sets isSwinging to the value
function handleSwingingCheck() {
    const useTool = usePlayerProps.getCurrentWeapon();
    if (!useTool.swingable) {
        return;
    };
    const mouseHistoryLength = usePlayerProps.mouseHistory.length;
    const currentAngle = (useTool.swingWeight ? Math.floor((mouseHistoryLength-1) - useTool.swingWeight) : 0);
    const nextAngle = (currentAngle == 49 ? currentAngle-1 : currentAngle+1);
    const total = Math.abs(Math.abs(usePlayerProps.mouseHistory[currentAngle]) - Math.abs(usePlayerProps.mouseHistory[nextAngle]));

    usePlayerProps.isSwinging = (total > 0.2616);
};

// gets mouse click
function establishMouseClick(event) {
    if (usePlayerProps.currentWeapon == 'sword') {
        if (usePlayerProps.canAttack) {
            usePlayerProps.canAttack = false;
            usePlayerProps.attacking = true;
            usePlayerProps.blocking = false;
            usePlayerProps.initialAttackAngle = usePlayerProps.getWeaponAngle();
            setTimeout(() => {
                usePlayerProps.attacking = false;
                usePlayerProps.initialAttackAngle = 0;
                setTimeout(() => {
                    usePlayerProps.canAttack = true;
                    const currentEnemyLength = currentEnemies.length;
                    for (let i = currentEnemyLength - 1; i >= 0; i--) {
                        const selectedEnemy = currentEnemies[i];
                        selectedEnemy.wasAttacked = false;
                    };
                }, usePlayerProps.weaponData.attackCoolDown);
            }, usePlayerProps.weaponData.attackDuration);
        };
    } else {
        if (usePlayerProps.canShoot) {
            usePlayerProps.canShoot = false;
            usePlayerProps.shooting = true;
            usePlayerProps.bowData.shoot(usePlayerProps.x, usePlayerProps.mouseX, usePlayerProps.y, usePlayerProps.mouseY, 'player');
            setTimeout(() => {
                usePlayerProps.canShoot = true;
                usePlayerProps.shooting = false;
            }, usePlayerProps.bowData.fireRate);
        };
    };
};

// gets right mouse click
function establishRightMouseClick(event) {
    event.preventDefault();
    const useWeapon = usePlayerProps.getCurrentWeapon();
    if (useWeapon.canBlock) {
        usePlayerProps.blocking = !usePlayerProps.blocking;
    };
};


// draws the HUD
function drawHUD() {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.rect((mainCanvas.width - 250) / 2, mainCanvas.height - 30, 250, 25);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    if (usePlayerProps.health >= 50) {
        ctx.fillStyle = `rgba(${255 * ((usePlayerProps.maxHealth - usePlayerProps.health) * .02)}, 255, 1)`;
    } else {
        ctx.fillStyle = `rgba(255, ${Math.floor(255 * (usePlayerProps.health / usePlayerProps.maxHealth))}, 0, 1)`;
    };
    ctx.rect((mainCanvas.width - 242.5) / 2, mainCanvas.height - 27.5, 242.5 * (usePlayerProps.health / 100), 20);
    ctx.fill();
    ctx.closePath();
}

// draws dropped items
function drawDroppedItems() {
    const droppedLength = currentDropItems.length;
    for (let i = droppedLength - 1; i > -1; i--) {
        const currentDroppedItem = currentDropItems[i];
        const distanceFromPlayer = Math.sqrt((usePlayerProps.x - currentDroppedItem.x) ** 2 + (usePlayerProps.y - currentDroppedItem.y) ** 2);
        if (distanceFromPlayer > (currentDroppedItem.sizeX + currentDroppedItem.sizeY) / 2) {
            currentDroppedItem.draw();
        } else {
            currentDroppedItem.pickUp();
            currentDropItems.splice(i, 1);
        };
    };
};

// handles moving bullets
function moveBullets() {
    const bulletLength = currentBullets.length;
    for (let i = bulletLength - 1; i > -1; i--) {
        const useBullet = currentBullets[i];
        if (!useBullet) {
            continue;
        };
        if (useBullet.onStep) {
            useBullet.onStep();
        };
        useBullet.x += (settings.bulletSpeed * Math.cos(useBullet.angle + Math.PI / 2));
        useBullet.y += (settings.bulletSpeed * Math.sin(useBullet.angle + Math.PI / 2));
        if (useBullet.x < 0 || useBullet.x > mainCanvas.width || useBullet.y < 0 || useBullet.y > mainCanvas.height) {
            //console.log(currentBullets[i])
            currentBullets.splice(i, 1);
            continue;
        };
        if (useBullet.source == 'player') {
            let hitEnemy = false;
            const enemyLength = currentEnemies.length;
            for (let j = enemyLength - 1; j > -1; j--) {
                const useEnemy = currentEnemies[j];
                if (useEnemy && useEnemy.health > 0) {
                    const distance = Math.sqrt((useEnemy.x - useBullet.x) ** 2 + (useEnemy.y - useBullet.y) ** 2);
                    if (distance <= (useEnemy.hitBoxX + useEnemy.hitBoxY) / 2) {
                        if (!useEnemy.reflectsBullets) {
                            hitEnemy = true;
                            useEnemy.health -= useBullet.damage;
                            if (useBullet.onImpact) {
                                useBullet.onImpact(useEnemy);
                            };
                            if (useEnemy.health <= 0) {
                                useEnemy.die();
                            };
                            if (useBullet.piercing) {
                                useBullet.damage -= (useEnemy.health + useBullet.damage);
                                hitEnemy = false;
                                if (useBullet.damage <= 0) {
                                    break;
                                };
                            };
                        } else {
                            useBullet.source = 'enemy'
                            useBullet.angle += Math.PI; 
                        };
                    };
                };
            };
            if (hitEnemy || useBullet.damage <= 0) {
                if (currentBullets[i]) {
                    currentBullets.splice(i, 1);
                    continue;
                };
            };
        } else {
            const distance = Math.sqrt((usePlayerProps.x - useBullet.x) ** 2 + (usePlayerProps.y - useBullet.y) ** 2);
            if (distance <= (usePlayerProps.sizeX + usePlayerProps.sizeY) / 2) {
                usePlayerProps.health -= useBullet.damage;
                if (useBullet.onImpact) {
                    useBullet.onImpact(usePlayerProps);
                };
                currentBullets.splice(i, 1);
                continue;
            };
        };
        useBullet.draw();
        /*
        ctx.beginPath(); // For debugging!
        ctx.fillStyle = 'blue';
        ctx.rect(useBullet.x, useBullet.y, 5, 5);
        ctx.fill();
        ctx.closePath();
        */
    };
};

// plays transition
async function wait(time) {
    return new Promise((success) => {
        setTimeout(() => { success() }, time);
    });
};

async function drawWaveNumber(i) {
    ctx.font = '25px Black Ops One';
    let useOpacity = 1;
    if (i < settings.waveDisplayTime / 3) {
        useOpacity = (i / (settings.waveDisplayTime / 3));
    } else if (i >= settings.waveDisplayTime / 3 && i <= settings.waveDisplayTime * 2 / 3) {
        useOpacity = 1;
    } else {
        useOpacity = ((settings.waveDisplayTime / i) * 2) - 2;
    };
    ctx.fillStyle = `rgba(0, 0, 0, ${useOpacity})`;
    ctx.fillText(`Wave ${settings.currentWave + 1}`, mainCanvas.width * .8, mainCanvas.height - 25, 100);
};

// plays transition
async function playTransition() {
    const transitionSlides = levelData[settings.currentLevel].transition.length;
    for (let i = 0; i < transitionSlides; i++) {
        const useImageData = levelData[settings.currentLevel].transition[i];

        ctx.save();
        ctx.translate(0, 0);
        ctx.beginPath();
        ctx.drawImage(useImageData[0], 0, 0, 500, 500);
        ctx.closePath();
        ctx.restore();
        await wait(useImageData[1]);
    };
};

// assigns enemys to hords
function makeHords() {
    const enemyLength = currentEnemies.length;
    for (let i = 0; i < enemyLength; i++) {
        const enemy = currentEnemies[i];
        if (!enemy.moving) {
            continue;
        };
        const enemySize = (enemy.hitBoxX + enemy.hitBoxY) / 2;
        const addToHord = [];

        for (let j = 0; j < enemyLength; j++) {
            if (i != j) {
                const otherEnemy = currentEnemies[j];
                if (!otherEnemy.moving || enemy.movementSpeed != otherEnemy.movementSpeed) {
                    continue;
                };
                const otherSize = (otherEnemy.hitBoxX + otherEnemy.hitBoxY) / 2;
                if (enemySize != otherSize) {
                    continue;
                };

                const [dX, dY, distance] = getDistance(otherEnemy, enemy);

                if (distance <= settings.minHordRange + enemySize) {
                    addToHord.push(otherEnemy);
                };
            };
        };
        if (!addToHord[0]) {
            continue;
        };

        let alreadyInAHord = false;
        const hordLength = currentHords.length;
        for (let j = 0; j < hordLength; j++) {
            const hord = currentHords[j];
            if (hord.members.includes(this)) {
                alreadyInAHord = true;
                hord.members = [...hord.members, ...addToHord];
                break;
            }
        };
        if (!alreadyInAHord) {
            addToHord.push(enemy);
            currentHords.push({
                members: addToHord,
            });
        };
    };

    const hordLength = currentHords.length;
    for (let i = 0; i < hordLength; i++) {
        const hord = currentHords[i];
        const centerPos = [0, 0];
        const memberLength = hord.members.length;
        for (let j = 0; j < memberLength; j++) {
            const member = hord.members[j];
            centerPos[0] += member.x;
            centerPos[1] += member.y;
        };
        centerPos[0] = centerPos[0] / memberLength;
        centerPos[1] = centerPos[1] / memberLength;
        hord.x = centerPos[0];
        hord.y = centerPos[1];

        const [eX, eY] = inBounds(Math.round(hord.x / settings.gridRes) * settings.gridRes, Math.round(hord.y / settings.gridRes) * settings.gridRes);
        const [pX, pY] = inBounds(Math.round(usePlayerProps.x / settings.gridRes) * settings.gridRes, Math.round(usePlayerProps.y / settings.gridRes) * settings.gridRes);
        const maxIterations = Math.round(Math.sqrt((pX - eX) ** 2 + (pY - eY) ** 2) * 1.5);

        if (maxIterations <= 25) {
            hord.path = [];
            continue;
        };

        const pathMap = new Map();
        for (let mapX = 0; mapX < mainCanvas.width + settings.gridRes; mapX += settings.gridRes) {
            pathMap.set(mapX, {});
        };

        fillMap(hord.members, hord.members[0].hitBoxX, hord.members[0].hitBoxY, pathMap);

        const start = pathMap.get(eX)[eY];
        const end = pathMap.get(pX)[pY];
        const path = makePath(start, end, maxIterations, pathMap);
        if (path[0]) {
            path.splice(0, 1);
        };

        hord.path = path;
    };
};

// main game loop
let amountSummoned = 0;
let stillEnemiesToSummon = true;
let gameClock = 0;
async function playLevel() {
    while (true) {
        // Clock stuff
        gameClock += 1;
        if (stillEnemiesToSummon) {
            const currentWaveData = levelData[settings.currentLevel].waves[settings.currentWave];
            if (currentWaveData) {
                const levelEnemiesLength = currentWaveData.length;
                for (let i = 0; i < levelEnemiesLength; i++) {
                    const enemyData = currentWaveData[i];
                    if (enemyData[0] == gameClock) {
                        summonEnemy(enemyData);
                        amountSummoned += 1;
                        if (amountSummoned >= levelEnemiesLength) {
                            stillEnemiesToSummon = false;
                            break;
                        };
                    };
                };
            } else if (currentEnemies.length <= 0){
                console.log('Next Level');
                break;
            };
        };
        if (gameClock >= settings.maxTimeBeforeNextWave) {
            console.log('Times up! Next wave!');
            gameClock = 0;
            settings.currentWave += 1;
            amountSummoned = 0;
            stillEnemiesToSummon = true;
        };

        // Reset/update stuff
        ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        ctx.drawImage(levelData[settings.currentLevel].background, 0, 0, mainCanvas.width, mainCanvas.height);
        usePlayerProps.updateXY();
        usePlayerProps.getUseTexture();

        //Draw floor objects
        const floorgroundLength = currentFloorgrounds.length;
        for (let i = floorgroundLength - 1; i >= 0; i--) {
            const item = currentFloorgrounds[i];
            if (item.dead) {
                currentFloorgrounds.splice(i, 1);
            } else {
                const [dX, dY, distance] = getDistance(usePlayerProps, item);
                if (distance < item.range + (usePlayerProps.sizeX + usePlayerProps.sizeY)/2) {
                    usePlayerProps.health -= item.damage; 
                };
                ctx.drawImage(item.texture, item.x - item.sizeX / 2, item.y - item.sizeY / 2, item.sizeX, item.sizeY);
            };
        };

        // Draw non-characters
        moveBullets();
        drawDroppedItems();

        // Sword stab and slash debuff
        let stabSwinging = false;
        if (usePlayerProps.attacking) {
            const currentMouseAngle = usePlayerProps.getWeaponAngle();
            if (Math.abs(usePlayerProps.initialAttackAngle - currentMouseAngle) > .5) {
                stabSwinging = true;
            };
        };

        // Draw player and enemies
        usePlayerProps.draw(usePlayerProps.x, usePlayerProps.y);
        const weaponUsing = usePlayerProps.getCurrentWeapon();
        const [angle, offsetX, offsetY] = getWeaponPosition(usePlayerProps.x, usePlayerProps.y, usePlayerProps.mouseX, usePlayerProps.mouseY, weaponUsing.sizeX, weaponUsing.sizeY, weaponUsing.offset, usePlayerProps.attacking);
        const currentEnemyLength = currentEnemies.length;
        makeHords();
        for (let i = currentEnemyLength - 1; i >= 0; i--) {
            const selectedEnemy = currentEnemies[i];
            if (!selectedEnemy.singleTexture) {
                selectedEnemy.getUseTexture();
            };
            selectedEnemy.tickAction();
            selectedEnemy.draw(selectedEnemy.x, selectedEnemy.y);
            const averageHitBox = (selectedEnemy.hitBoxX + selectedEnemy.hitBoxY) / 2;
            const canStab = (!selectedEnemy.wasAttacked && usePlayerProps.attacking);
            const canSwing = (!selectedEnemy.wasSwingAttacked && usePlayerProps.isSwinging && !usePlayerProps.blocking && ((usePlayerProps.currentWeapon == 'sword' && usePlayerProps.weaponData.swingable) || (usePlayerProps.currentWeapon == 'bow' && usePlayerProps.bowData.swingable)));
            if (canStab || canSwing) {
                const useAngle = usePlayerProps.getWeaponAngle();
                const initialOffset = (((canStab && !stabSwinging> 0) || (usePlayerProps.bites > 0 && selectedEnemy.constructor.name)) ? 0 : usePlayerProps.weaponData.offset);
                const x1 = usePlayerProps.x + (initialOffset * Math.cos(useAngle + Math.PI / 2));
                const y1 = usePlayerProps.y + (initialOffset * Math.sin(useAngle + Math.PI / 2));
                const x2 = usePlayerProps.x + (offsetY * Math.cos(useAngle + Math.PI / 2));
                const y2 = usePlayerProps.y + (offsetY * Math.sin(useAngle + Math.PI / 2));

                const xMin = selectedEnemy.x - selectedEnemy.hitBoxX/2;
                const xMax = selectedEnemy.x + selectedEnemy.hitBoxX/2;
                const yMin = selectedEnemy.y - selectedEnemy.hitBoxY/2;
                const yMax = selectedEnemy.y + selectedEnemy.hitBoxY/2;

                /*ctx.fillStyle = 'rgb(125, 125, 125)';
                ctx.beginPath();
                ctx.rect(xMin, yMin, 25, 25);
                ctx.fill();
                ctx.closePath();

                ctx.save();
                ctx.translate(x1, y1);
                //ctx.rotate(useAngle+ Math.PI / 2);
                ctx.fillStyle = 'rgb(200, 200, 200)';
                ctx.beginPath();
                ctx.rect(0, 0, 5, 5);
                ctx.fill();
                ctx.closePath();
                ctx.restore();

                debugger;*/
                if (lineIntersects(x1, y1, x2, y2, xMin, yMin, xMax, yMax)) {
                    if ((canStab && !stabSwinging)) {
                        selectedEnemy.wasAttacked = true;
                        selectedEnemy.health -= usePlayerProps.weaponData.damage;
                    } else {
                        selectedEnemy.wasSwingAttacked = true;
                        selectedEnemy.health -= weaponUsing.swingDamge;
                    };
                    if (selectedEnemy.health <= 0) {
                        selectedEnemy.die();
                    };
                };
                
            };

            if (selectedEnemy.health > 0) {
                const [dX, dY, distance] = getDistance(usePlayerProps, selectedEnemy);
                const trueDistance = distance - (selectedEnemy.hitBoxX + selectedEnemy.hitBoxY)/2;
                const ratio = (trueDistance/((mainCanvas.width + mainCanvas.height)/8));
                const proximity = ((ratio < 0) ? 0 : ((ratio >= 1) ? 1 : ratio));
                
                const useAdjustmentSpeed = ((selectedEnemy.currentWeapon == 'sword') ? (selectedEnemy.adjustmentSpeed) : Math.floor(selectedEnemy.adjustmentSpeed/2));
                const moveLength = (usePlayerProps.movementHistory.length + 1);
                const adjustDiff = (moveLength - useAdjustmentSpeed);
                const speed = ((proximity >= 1) ? adjustDiff : ((proximity < 0) ? moveLength : Math.floor(adjustDiff + ((1-proximity) * useAdjustmentSpeed))));
                
                const useSpeed = ((speed > (moveLength - selectedEnemy.minAdjustSpeed)) ? (moveLength - selectedEnemy.minAdjustSpeed) : speed);

                const usePos = usePlayerProps.movementHistory[useSpeed];
                if (usePos) {
                    if (selectedEnemy.currentWeapon == 'sword') {
                        const [enemyAngle, enemyOffsetX, enemyOffsetY] = getWeaponPosition(selectedEnemy.x, selectedEnemy.y, usePos[0], usePos[1], selectedEnemy.weaponData.sizeX, selectedEnemy.weaponData.sizeY + averageHitBox, selectedEnemy.weaponData.offset, selectedEnemy.attacking);
                        selectedEnemy.weaponData.draw(selectedEnemy.x, selectedEnemy.y, enemyAngle, enemyOffsetX, enemyOffsetY, false, !selectedEnemy.canAttack, selectedEnemy.opacity);
                    } else {
                        const [enemyAngle, enemyOffsetX, enemyOffsetY] = getWeaponPosition(selectedEnemy.x, selectedEnemy.y, usePos[0], usePos[1], selectedEnemy.bowData.sizeX, selectedEnemy.bowData.sizeY + averageHitBox, selectedEnemy.bowData.offset, null);
                        selectedEnemy.bowData.draw(selectedEnemy.x, selectedEnemy.y, enemyAngle, enemyOffsetX, selectedEnemy.bowData.yOffset, false, !selectedEnemy.canShoot, selectedEnemy.opacity);
                    };
                };
            };
        };
        
        if (usePlayerProps.currentWeapon == 'sword') {
            usePlayerProps.weaponData.draw(usePlayerProps.x, usePlayerProps.y, (usePlayerProps.getWeaponAngle()), offsetX, offsetY, usePlayerProps.blocking, !usePlayerProps.canAttack);
        } else {
            usePlayerProps.bowData.draw(usePlayerProps.x, usePlayerProps.y, (usePlayerProps.getWeaponAngle()), offsetX, usePlayerProps.bowData.yOffset, usePlayerProps.blocking, !usePlayerProps.canShoot);
        };

        /*onst hordLength = currentHords.length; // Debug for hords
        for (let i = 0; i < hordLength; i++) {
            const hord = currentHords[i];
            const color = `rgb(${i * 25}, ${255 - (i * 25)}, ${i * 25})`;
            const memberLength = hord.members.length;
            for (let j = 0; j < memberLength; j++) {
                const member = hord.members[j];
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.rect(member.x - member.hitBoxX / 2, member.y - member.hitBoxY / 2, member.hitBoxX, member.hitBoxY);
                ctx.fill();
                ctx.closePath();
            };
        };*/

        usePlayerProps.mouseHistory.push(angle);
        const mouseHistoryLength = usePlayerProps.mouseHistory.length;
        if (mouseHistoryLength > 50) {
            usePlayerProps.mouseHistory.splice(0, 1);
        };
        handleSwingingCheck();

        if (!stillEnemiesToSummon && currentEnemies.length <= 0) {
            stillEnemiesToSummon = true;
            setTimeout(() => {
                if (amountSummoned != 0) {
                    settings.currentWave += 1;
                    amountSummoned = 0;
                    gameClock = 0;
                };
            }, settings.timeBeforeNextWave);
        };

        // Final drawing
        const foregroundLength = currentForegrounds.length;
        for (let i = foregroundLength - 1; i >= 0; i--) {
            const item = currentForegrounds[i];
            if (item.dead) {
                currentForegrounds.splice(i, 1);
            } else {
                ctx.drawImage(item.texture, item.x - item.sizeX / 2, item.y - item.sizeY / 2, item.sizeX, item.sizeY);
            };
        };

        /*// debug for player movment history
        const movementHistoryLength = usePlayerProps.movementHistory.length;
        for (let i = 0; i < movementHistoryLength; i++) {
            const history = usePlayerProps.movementHistory[i];
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.rect(history[0], history[1], 5, 5);
            ctx.fill();
            ctx.closePath();
        };*/
        

        ctx.drawImage(levelData[settings.currentLevel].foreground, 0, 0, mainCanvas.width, mainCanvas.height);
        drawHUD();
        if (gameClock <= settings.waveDisplayTime && levelData[settings.currentLevel].waves[settings.currentWave]) {
            drawWaveNumber(gameClock);
        };

        // End check
        currentHords.splice(0, currentHords.length);
        if (usePlayerProps.health <= 0) {
            break;
        } else {
            await waitTick();
        };
    };
};

// handles core loop
async function runGame() {
    await new Promise((results) => {
        gameTextures.titleCard.onload = () => {
            results();
        };
    })
    while (true) {
        await makeLoadingScreen();
        await bootGame();
        while (true) {
            clearVitalLists();
            if (!settings.hasShownTransition) {
                await playTransition();
                settings.hasShownTransition = true;
            };
            document.addEventListener('keydown', establishUserInputDown);
            document.addEventListener('keyup', establishUserInputUp);
            document.addEventListener('mousemove', establishMouseInput);
            document.addEventListener('click', establishMouseClick);
            document.addEventListener('contextmenu', establishRightMouseClick);
            await playLevel();
            document.removeEventListener('keydown', establishUserInputDown);
            document.removeEventListener('keyup', establishUserInputUp);
            document.removeEventListener('mousemove', establishMouseInput);
            document.removeEventListener('click', establishMouseClick);
            document.removeEventListener('contextmenu', establishRightMouseClick);
            currentHords.splice(0, currentHords.length);
            if (usePlayerProps.health > 0) {
                if (settings.currentLevel == 12) {
                    const retry = await optionsOnDeath();
                    if (retry) {
                        settings.currentLevel = 11;
                        reloadGame();
                    } else {
                        break;
                    };
                } else {
                    settings.currentLevel += 1;
                    await handleShop();
                    reloadGame();
                    settings.hasShownTransition = false;
                };
            } else {
                const retry = await optionsOnDeath();
                if (retry) {
                    reloadGame();
                } else {
                    break;
                };
            };
        };
    };
};

runGame();
// End

