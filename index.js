/**
 * @module
 */

const Case = require('case');

/**
 * CombineJS internal Node API class
 *
 * @module
 */
class CombineNode {
    /**
     *
     * @param name {String} parsed name of node
     */
    constructor(name) {
        let isCapitalizeFirstLetter = name[0].toLowerCase() !== name[0];

        /**
         * internal name of node
         * using for debug
         *
         * @type {String}
         */
        this.name     = name;

        /**
         * block name of the BEM methodology
         * {@link https://en.bem.info/methodology/naming-convention/}.
         *
         * @type {String}
         */
        this.blockName = isCapitalizeFirstLetter ? name : '';

        /**
         * element name of the BEM methodology
         * {@link https://en.bem.info/methodology/naming-convention/}.
         *
         * @type {string}
         */
        this.elementName = ! isCapitalizeFirstLetter ? name : '';

        /**
         * if the node blocks of the BEM methodology
         * {@link https://en.bem.info/methodology/naming-convention/}.
         *
         * @type {boolean}
         */
        this.isBlock = isCapitalizeFirstLetter;

        /**
         * if the node element of the BEM methodology
         * {@link https://en.bem.info/methodology/naming-convention/}.
         *
         * @type {boolean}
         */
        this.isElement = ! isCapitalizeFirstLetter;

        /**
         * the internal props namespaces storage
         *
         * @type {{}}
         * @private
         */
        this._props   = {};

        /**
         * the storage of children nodes
         *
         * @type {CombineNode[]}
         * @private
         */
        this._content = [];

        /**
         * the storage of mixed nodes
         *
         * @type {CombineNode[]}
         * @private
         */
        this._mixins = [];

        /**
         * the storage of attached directives
         *
         * @type {{}}
         * @private
         */
        this._directives = {};
    }

    /**
     * Add to the end of the list of children of the new node
     *
     * @param node {CombineNode}
     */
    addChild(node) {
        this._content.push(node);
    }

    /**
     * Rewrite or setup list of children of the new node list
     *
     * @param nodes {CombineNode[]}
     */
    setChilds(nodes) {
        this._content = nodes;
    }

    /**
     * Return list of children nodes
     *
     * @returns {CombineNode[]}
     */
    getChilds() {
        return this._content;
    }

    /**
     * If this node has any children node return true
     *
     * @returns {boolean}
     */
    hasChilds() {
        return this._content.length > 0;
    }

    /**
     * If this node no has children nodes
     *
     * @returns {boolean}
     */
    emptyChilds() {
        return this._content.length === 0;
    }

    /**
     * Add to the end of the list of mixin nodes of the new node
     *
     * @param mixinNode {CombineNode}
     */
    addMixin(mixinNode) {
        this._mixins.push(mixinNode);
    }

    /**
     * Get all mixin nodes by priority
     *
     * @returns {CombineNode[]}
     */
    getMixines() {
        return this._mixins;
    }

    /**
     * Add directive instance to this node
     *
     * @param name {String}
     * @param directive
     */
    addDirective(name, directive) {
        this._directives[name] = directive;
    }

    /**
     * Get directive instance by name
     *
     * @param name
     * @returns {*}
     */
    getDirective(name) {
        return this._directives[name];
    }

    /**
     * If named directive exists
     *
     * @param name
     * @returns {boolean}
     */
    hasDirective(name) {
        return this._directives.hasOwnProperty(name);
    }

    /**
     * Get directive list by priority of this node
     *
     * @returns {*}
     */
    getDirectives() {
        return this._directives;
    }

    /**
     * Get namespace of properties
     *
     * @param name
     * @returns {*}
     */
    getPropNS(name) {
        return this._props[name];
    }

    /**
     * If exists namespace of properties
     *
     * @param name
     * @returns {boolean}
     */
    hasPropNS(name) {
        return this._props.hasOwnProperty(name);
    }

    /**
     * Get property value
     *
     * @param {String} namespace
     * @param {String} name
     *
     * @returns {String|null}
     */
    getProp(namespace, name) {
        return this.getPropNS(namespace)[name];
    }

    /**
     * If exists property
     *
     * @param namespace
     * @param name
     *
     * @returns {boolean}
     */
    hasProp(namespace, name) {
        return this.hasPropNS(namespace) && this.getPropNS(namespace).hasOwnProperty(name);
    }

    /**
     * Set property of the node
     *
     * @param namespace
     * @param name
     * @param value
     */
    setProp(namespace, name, value) {
        if (! this.hasPropNS(namespace)) {
            this._props[namespace] = {};
        }

        this._props[namespace][name] = value;
    }

    /**
     * Get horizontal nodes list with mixin by priority
     *
     * @returns {Array.<CombineNode>}
     */
    getAllMixedNodes() {
        return [this].concat(this.getMixines());
    }

    /**
     * Calc html tag of this node with mixin list
     *
     * @returns {string}
     */
    getHtmlTag() {
        let tag = 'div';

        for (let node of this.getAllMixedNodes()) {
            if (node.hasProp('html', 'tag')) {
                tag = node.getProp('html', 'tag');
            }
        }

        return tag;
    }

    /**
     * Calc css rules of this node with mixin list
     *
     * @returns {string}
     */
    getCssMixedRules() {
        let mixedRules = {},
            result     = [];

        for (let node of this.getAllMixedNodes()) {
            if (node.hasPropNS('css')) {
                Object.assign(mixedRules, node.getPropNS('css'));
            }
        }

        for (let cssRule of Object.keys(mixedRules)) {
            result.push(`${Case.kebab(cssRule)}:${mixedRules[cssRule]}`);
        }

        return result.join(';');
    }

    /**
     * Calc html classNames of this node
     *
     * @returns {string}
     */
    getHtmlClass() {
        return Case.kebab(this.blockName) + (this.isElement ? `__${Case.kebab(this.elementName)}` : '');
    }

    /**
     * Calc html classNames of this node with mixin list
     *
     * @returns {string}
     */
    getHtmlMixedClass() {
        let classes = [];

        for (let node of this.getAllMixedNodes()) {
            classes.push(node.getHtmlClass());
        }

        return classes.join(' ');
    }

    /**
     * Calc attributes string of this node
     *
     * @returns {string}
     * @private
     */
    _getAttributesString() {
        let attrs = {
                'class'  : this.getHtmlMixedClass(),
                'styles' : this.getCssMixedRules()
            },
            result = [];

        for (let name of Object.keys(attrs)) {
            if (attrs[name].length > 0) {
                result.push(`${name}="${attrs[name]}"`);
            }
        }

        return result.join(' ');
    }

    /**
     * Get html open tag string
     *
     * @returns {*}
     */
    getHtmlTagStart() {
        return `<${this.getHtmlTag()} ${this._getAttributesString()}>`;
    }

    /**
     * Get html close tag string
     *
     * @returns {*}
     */
    getHtmlTagEnd() {
        return `</${this.getHtmlTag()}>`;
    }
}

module.exports = CombineNode;