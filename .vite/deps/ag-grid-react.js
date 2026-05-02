import {
  AgPromise,
  BaseComponentWrapper,
  BeanStub,
  CssClassManager,
  EmptyBean,
  FakeHScrollComp,
  FakeVScrollComp,
  GridBodyCtrl,
  GridCoreCreator,
  GridCtrl,
  GridHeaderCtrl,
  HeaderRowContainerCtrl,
  RowContainerCtrl,
  TabGuardClassNames,
  TabGuardCtrl,
  VanillaFrameworkOverrides,
  _combineAttributesAndGridOptions,
  _getActiveDomElement,
  _getGridOption,
  _getGridRegisteredModules,
  _getRowContainerClass,
  _getRowContainerOptions,
  _getRowSpanContainerClass,
  _getRowViewportClass,
  _isClientSideRowModel,
  _isServerSideRowModel,
  _observeResize,
  _processOnChange,
  _removeAriaSort,
  _removeFromParent,
  _setAriaColCount,
  _setAriaRowCount,
  _setAriaSort,
  _toString,
  _warn
} from "./chunk-VJC7CIFV.js";
import {
  require_react_dom
} from "./chunk-GYTVARJC.js";
import {
  require_react
} from "./chunk-BHGA32AN.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// node_modules/ag-grid-react/dist/package/index.esm.mjs
var import_react = __toESM(require_react(), 1);
var import_react2 = __toESM(require_react(), 1);
var import_react3 = __toESM(require_react(), 1);
var import_react4 = __toESM(require_react(), 1);
var import_react5 = __toESM(require_react(), 1);
var import_react_dom = __toESM(require_react_dom(), 1);
var import_react6 = __toESM(require_react(), 1);
var import_react7 = __toESM(require_react(), 1);
var import_react8 = __toESM(require_react(), 1);
var import_react_dom2 = __toESM(require_react_dom(), 1);
var import_react9 = __toESM(require_react(), 1);
var import_react10 = __toESM(require_react(), 1);
var import_react11 = __toESM(require_react(), 1);
var import_react12 = __toESM(require_react(), 1);
var import_react13 = __toESM(require_react(), 1);
var import_react14 = __toESM(require_react(), 1);
var import_react15 = __toESM(require_react(), 1);
var import_react16 = __toESM(require_react(), 1);
var import_react17 = __toESM(require_react(), 1);
var import_react18 = __toESM(require_react(), 1);
var import_react19 = __toESM(require_react(), 1);
var import_react20 = __toESM(require_react(), 1);
var import_react21 = __toESM(require_react(), 1);
var import_react22 = __toESM(require_react(), 1);
var import_react_dom3 = __toESM(require_react_dom(), 1);
var import_react23 = __toESM(require_react(), 1);
var import_react24 = __toESM(require_react(), 1);
var import_react25 = __toESM(require_react(), 1);
var import_react26 = __toESM(require_react(), 1);
var import_react27 = __toESM(require_react(), 1);
var BeansContext = import_react4.default.createContext({});
var RenderModeContext = import_react4.default.createContext("default");
var showJsComp = (compDetails, context, eParent, ref) => {
  const doNothing = !compDetails || compDetails.componentFromFramework || context.isDestroyed();
  if (doNothing) {
    return;
  }
  const promise = compDetails.newAgStackInstance();
  let comp;
  let compGui;
  let destroyed = false;
  promise.then((c) => {
    if (destroyed) {
      context.destroyBean(c);
      return;
    }
    comp = c;
    compGui = comp.getGui();
    eParent.appendChild(compGui);
    setRef(ref, comp);
  });
  return () => {
    destroyed = true;
    if (!comp) {
      return;
    }
    compGui?.remove();
    context.destroyBean(comp);
    if (ref) {
      setRef(ref, void 0);
    }
  };
};
var setRef = (ref, value) => {
  if (!ref) {
    return;
  }
  if (ref instanceof Function) {
    const refCallback = ref;
    refCallback(value);
  } else {
    const refObj = ref;
    refObj.current = value;
  }
};
var classesList = (...list) => {
  const filtered = list.filter((s) => s != null && s !== "");
  return filtered.join(" ");
};
var CssClasses = class _CssClasses {
  constructor(...initialClasses) {
    this.classesMap = {};
    for (const className of initialClasses) {
      this.classesMap[className] = true;
    }
  }
  setClass(className, on) {
    const nothingHasChanged = !!this.classesMap[className] == on;
    if (nothingHasChanged) {
      return this;
    }
    const res = new _CssClasses();
    res.classesMap = { ...this.classesMap };
    res.classesMap[className] = on;
    return res;
  }
  toString() {
    const res = Object.keys(this.classesMap).filter((key) => this.classesMap[key]).join(" ");
    return res;
  }
};
var isComponentStateless = (Component2) => {
  const hasSymbol = () => typeof Symbol === "function" && Symbol.for;
  const getMemoType = () => hasSymbol() ? /* @__PURE__ */ Symbol.for("react.memo") : 60115;
  return typeof Component2 === "function" && !(Component2.prototype && Component2.prototype.isReactComponent) || typeof Component2 === "object" && Component2.$$typeof === getMemoType();
};
var reactVersion = import_react5.default.version?.split(".")[0];
var isReactVersion17Minus = reactVersion === "16" || reactVersion === "17";
function isReact19() {
  return reactVersion === "19";
}
var disableFlushSync = false;
function runWithoutFlushSync(func) {
  if (!disableFlushSync) {
    setTimeout(() => disableFlushSync = false, 0);
  }
  disableFlushSync = true;
  return func();
}
var agFlushSync = (useFlushSync, fn) => {
  if (!isReactVersion17Minus && useFlushSync && !disableFlushSync) {
    import_react_dom.default.flushSync(fn);
  } else {
    fn();
  }
};
var agStartTransition = (fn) => {
  if (!isReactVersion17Minus) {
    import_react5.default.startTransition(fn);
  } else {
    fn();
  }
};
function agUseSyncExternalStore(subscribe, getSnapshot, defaultSnapshot) {
  if (import_react5.default.useSyncExternalStore) {
    return import_react5.default.useSyncExternalStore(subscribe, getSnapshot);
  } else {
    return defaultSnapshot;
  }
}
function getNextValueIfDifferent(prev, next, maintainOrder) {
  if (next == null || prev == null) {
    return next;
  }
  if (prev === next || next.length === 0 && prev.length === 0) {
    return prev;
  }
  if (maintainOrder || prev.length === 0 && next.length > 0 || prev.length > 0 && next.length === 0) {
    return next;
  }
  const oldValues = [];
  const newValues = [];
  const prevMap = /* @__PURE__ */ new Map();
  const nextMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < next.length; i++) {
    const c = next[i];
    nextMap.set(c.instanceId, c);
  }
  for (let i = 0; i < prev.length; i++) {
    const c = prev[i];
    prevMap.set(c.instanceId, c);
    if (nextMap.has(c.instanceId)) {
      oldValues.push(c);
    }
  }
  for (let i = 0; i < next.length; i++) {
    const c = next[i];
    const instanceId = c.instanceId;
    if (!prevMap.has(instanceId)) {
      newValues.push(c);
    }
  }
  if (oldValues.length === prev.length && newValues.length === 0) {
    return prev;
  }
  if (oldValues.length === 0 && newValues.length === next.length) {
    return next;
  }
  if (oldValues.length === 0) {
    return newValues;
  }
  if (newValues.length === 0) {
    return oldValues;
  }
  return [...oldValues, ...newValues];
}
var GroupCellRenderer = (0, import_react3.forwardRef)((props, ref) => {
  const { registry, context } = (0, import_react3.useContext)(BeansContext);
  const eGui = (0, import_react3.useRef)(null);
  const eValueRef = (0, import_react3.useRef)(null);
  const eCheckboxRef = (0, import_react3.useRef)(null);
  const eExpandedRef = (0, import_react3.useRef)(null);
  const eContractedRef = (0, import_react3.useRef)(null);
  const ctrlRef = (0, import_react3.useRef)();
  const [innerCompDetails, setInnerCompDetails] = (0, import_react3.useState)();
  const [childCount, setChildCount] = (0, import_react3.useState)();
  const [value, setValue] = (0, import_react3.useState)();
  const [cssClasses, setCssClasses] = (0, import_react3.useState)(() => new CssClasses());
  const [expandedCssClasses, setExpandedCssClasses] = (0, import_react3.useState)(() => new CssClasses("ag-hidden"));
  const [contractedCssClasses, setContractedCssClasses] = (0, import_react3.useState)(() => new CssClasses("ag-hidden"));
  const [checkboxCssClasses, setCheckboxCssClasses] = (0, import_react3.useState)(() => new CssClasses("ag-invisible"));
  (0, import_react3.useImperativeHandle)(ref, () => {
    return {
      // force new instance when grid tries to refresh
      refresh() {
        return false;
      }
    };
  });
  (0, import_react3.useLayoutEffect)(() => {
    return showJsComp(innerCompDetails, context, eValueRef.current);
  }, [innerCompDetails]);
  const setRef2 = (0, import_react3.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || context.isDestroyed()) {
      ctrlRef.current = context.destroyBean(ctrlRef.current);
      return;
    }
    const compProxy = {
      setInnerRenderer: (details, valueToDisplay) => {
        setInnerCompDetails(details);
        setValue(valueToDisplay);
      },
      setChildCount: (count) => setChildCount(count),
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setContractedDisplayed: (displayed) => setContractedCssClasses((prev) => prev.setClass("ag-hidden", !displayed)),
      setExpandedDisplayed: (displayed) => setExpandedCssClasses((prev) => prev.setClass("ag-hidden", !displayed)),
      setCheckboxVisible: (visible) => setCheckboxCssClasses((prev) => prev.setClass("ag-invisible", !visible)),
      setCheckboxSpacing: (add) => setCheckboxCssClasses((prev) => prev.setClass("ag-group-checkbox-spacing", add))
    };
    const groupCellRendererCtrl = registry.createDynamicBean("groupCellRendererCtrl", true);
    if (groupCellRendererCtrl) {
      ctrlRef.current = context.createBean(groupCellRendererCtrl);
      ctrlRef.current.init(
        compProxy,
        eRef,
        eCheckboxRef.current,
        eExpandedRef.current,
        eContractedRef.current,
        GroupCellRenderer,
        props
      );
    }
  }, []);
  const className = (0, import_react3.useMemo)(() => `ag-cell-wrapper ${cssClasses.toString()}`, [cssClasses]);
  const expandedClassName = (0, import_react3.useMemo)(() => `ag-group-expanded ${expandedCssClasses.toString()}`, [expandedCssClasses]);
  const contractedClassName = (0, import_react3.useMemo)(
    () => `ag-group-contracted ${contractedCssClasses.toString()}`,
    [contractedCssClasses]
  );
  const checkboxClassName = (0, import_react3.useMemo)(() => `ag-group-checkbox ${checkboxCssClasses.toString()}`, [checkboxCssClasses]);
  const useFwRenderer = innerCompDetails?.componentFromFramework;
  const FwRenderer = useFwRenderer ? innerCompDetails.componentClass : void 0;
  const useValue = innerCompDetails == null && value != null;
  const escapedValue = _toString(value);
  return import_react3.default.createElement(
    "span",
    {
      className,
      ref: setRef2,
      ...!props.colDef ? { role: ctrlRef.current?.getCellAriaRole() } : {}
    },
    import_react3.default.createElement("span", { className: expandedClassName, ref: eExpandedRef }),
    import_react3.default.createElement("span", { className: contractedClassName, ref: eContractedRef }),
    import_react3.default.createElement("span", { className: checkboxClassName, ref: eCheckboxRef }),
    import_react3.default.createElement("span", { className: "ag-group-value", ref: eValueRef }, useValue ? escapedValue : useFwRenderer ? import_react3.default.createElement(FwRenderer, { ...innerCompDetails.params }) : null),
    import_react3.default.createElement("span", { className: "ag-group-child-count" }, childCount)
  );
});
var groupCellRenderer_default = GroupCellRenderer;
var CustomContext = (0, import_react7.createContext)({
  setMethods: () => {
  }
});
var CustomWrapperComp = (params) => {
  const { initialProps, addUpdateCallback, CustomComponentClass, setMethods } = params;
  const [{ key, ...props }, setProps] = (0, import_react6.useState)(initialProps);
  (0, import_react6.useEffect)(() => {
    addUpdateCallback((newProps) => setProps(newProps));
  }, []);
  return import_react6.default.createElement(CustomContext.Provider, { value: { setMethods } }, import_react6.default.createElement(CustomComponentClass, { key, ...props }));
};
var customWrapperComp_default = (0, import_react6.memo)(CustomWrapperComp);
var counter = 0;
function generateNewKey() {
  return `agPortalKey_${++counter}`;
}
var ReactComponent = class {
  constructor(reactComponent, portalManager, componentType, suppressFallbackMethods) {
    this.portal = null;
    this.oldPortal = null;
    this.reactComponent = reactComponent;
    this.portalManager = portalManager;
    this.componentType = componentType;
    this.suppressFallbackMethods = !!suppressFallbackMethods;
    this.statelessComponent = this.isStateless(this.reactComponent);
    this.key = generateNewKey();
    this.portalKey = generateNewKey();
    this.instanceCreated = this.isStatelessComponent() ? AgPromise.resolve(false) : new AgPromise((resolve) => {
      this.resolveInstanceCreated = resolve;
    });
  }
  getGui() {
    return this.eParentElement;
  }
  /** `getGui()` returns the parent element. This returns the actual root element. */
  getRootElement() {
    const firstChild = this.eParentElement.firstChild;
    return firstChild;
  }
  destroy() {
    if (this.componentInstance && typeof this.componentInstance.destroy == "function") {
      this.componentInstance.destroy();
    }
    const portal = this.portal;
    if (portal) {
      this.portalManager.destroyPortal(portal);
    }
  }
  createParentElement(params) {
    const componentWrappingElement = this.portalManager.getComponentWrappingElement();
    const eParentElement = document.createElement(componentWrappingElement || "div");
    eParentElement.classList.add("ag-react-container");
    params.reactContainer = eParentElement;
    return eParentElement;
  }
  statelessComponentRendered() {
    return this.eParentElement.childElementCount > 0 || this.eParentElement.childNodes.length > 0;
  }
  getFrameworkComponentInstance() {
    return this.componentInstance;
  }
  isStatelessComponent() {
    return this.statelessComponent;
  }
  getReactComponentName() {
    return this.reactComponent.name;
  }
  getMemoType() {
    return this.hasSymbol() ? /* @__PURE__ */ Symbol.for("react.memo") : 60115;
  }
  hasSymbol() {
    return typeof Symbol === "function" && Symbol.for;
  }
  isStateless(Component2) {
    return typeof Component2 === "function" && !(Component2.prototype && Component2.prototype.isReactComponent) || typeof Component2 === "object" && Component2.$$typeof === this.getMemoType();
  }
  hasMethod(name) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    return !!frameworkComponentInstance && frameworkComponentInstance[name] != null || this.fallbackMethodAvailable(name);
  }
  callMethod(name, args) {
    const frameworkComponentInstance = this.getFrameworkComponentInstance();
    if (this.isStatelessComponent()) {
      return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
    } else if (!frameworkComponentInstance) {
      setTimeout(() => this.callMethod(name, args));
      return;
    }
    const method = frameworkComponentInstance[name];
    if (method) {
      return method.apply(frameworkComponentInstance, args);
    }
    if (this.fallbackMethodAvailable(name)) {
      return this.fallbackMethod(name, !!args && args[0] ? args[0] : {});
    }
  }
  addMethod(name, callback) {
    this[name] = callback;
  }
  init(params) {
    this.eParentElement = this.createParentElement(params);
    this.createOrUpdatePortal(params);
    return new AgPromise((resolve) => this.createReactComponent(resolve));
  }
  createOrUpdatePortal(params) {
    if (!this.isStatelessComponent()) {
      this.ref = (element) => {
        this.componentInstance = element;
        this.resolveInstanceCreated?.(true);
        this.resolveInstanceCreated = void 0;
      };
      params.ref = this.ref;
    }
    this.reactElement = this.createElement(this.reactComponent, { ...params, key: this.key });
    this.portal = (0, import_react_dom2.createPortal)(
      this.reactElement,
      this.eParentElement,
      this.portalKey
      // fixed deltaRowModeRefreshCompRenderer
    );
  }
  createElement(reactComponent, props) {
    return (0, import_react8.createElement)(reactComponent, props);
  }
  createReactComponent(resolve) {
    this.portalManager.mountReactPortal(this.portal, this, resolve);
  }
  rendered() {
    return this.isStatelessComponent() && this.statelessComponentRendered() || !!(!this.isStatelessComponent() && this.getFrameworkComponentInstance());
  }
  /*
   * fallback methods - these will be invoked if a corresponding instance method is not present
   * for example if refresh is called and is not available on the component instance, then refreshComponent on this
   * class will be invoked instead
   *
   * Currently only refresh is supported
   */
  refreshComponent(args) {
    this.oldPortal = this.portal;
    this.createOrUpdatePortal(args);
    this.portalManager.updateReactPortal(this.oldPortal, this.portal);
  }
  fallbackMethod(name, params) {
    const method = this[`${name}Component`];
    if (!this.suppressFallbackMethods && !!method) {
      return method.bind(this)(params);
    }
  }
  fallbackMethodAvailable(name) {
    if (this.suppressFallbackMethods) {
      return false;
    }
    const method = this[`${name}Component`];
    return !!method;
  }
};
function addOptionalMethods(optionalMethodNames, providedMethods, component) {
  for (const methodName of optionalMethodNames) {
    const providedMethod = providedMethods[methodName];
    if (providedMethod) {
      component[methodName] = providedMethod;
    }
  }
}
var CustomComponentWrapper = class extends ReactComponent {
  constructor() {
    super(...arguments);
    this.awaitUpdateCallback = new AgPromise((resolve) => {
      this.resolveUpdateCallback = resolve;
    });
    this.wrapperComponent = customWrapperComp_default;
  }
  init(params) {
    this.sourceParams = params;
    return super.init(this.getProps());
  }
  addMethod() {
  }
  getInstance() {
    return this.instanceCreated.then(() => this.componentInstance);
  }
  getFrameworkComponentInstance() {
    return this;
  }
  createElement(reactComponent, props) {
    return super.createElement(this.wrapperComponent, {
      initialProps: props,
      CustomComponentClass: reactComponent,
      setMethods: (methods) => this.setMethods(methods),
      addUpdateCallback: (callback) => {
        this.updateCallback = () => {
          callback(this.getProps());
          return new AgPromise((resolve) => {
            setTimeout(() => {
              resolve();
            });
          });
        };
        this.resolveUpdateCallback();
      }
    });
  }
  setMethods(methods) {
    this.providedMethods = methods;
    addOptionalMethods(this.getOptionalMethods(), this.providedMethods, this);
  }
  getOptionalMethods() {
    return [];
  }
  getProps() {
    return {
      ...this.sourceParams,
      key: this.key,
      ref: this.ref
    };
  }
  refreshProps() {
    if (this.updateCallback) {
      return this.updateCallback();
    }
    return new AgPromise(
      (resolve) => this.awaitUpdateCallback.then(() => {
        this.updateCallback().then(() => resolve());
      })
    );
  }
};
var CellRendererComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};
var CustomOverlayComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
  }
};
var DateComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.date = null;
    this.onDateChange = (date) => this.updateDate(date);
  }
  getDate() {
    return this.date;
  }
  setDate(date) {
    this.date = date;
    this.refreshProps();
  }
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached", "setInputPlaceholder", "setInputAriaLabel", "setDisabled"];
  }
  updateDate(date) {
    this.setDate(date);
    this.sourceParams.onDateChanged();
  }
  getProps() {
    const props = super.getProps();
    props.date = this.date;
    props.onDateChange = this.onDateChange;
    delete props.onDateChanged;
    return props;
  }
};
var DragAndDropImageComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.label = "";
    this.icon = null;
    this.shake = false;
  }
  setIcon(iconName, shake) {
    this.icon = iconName;
    this.shake = shake;
    this.refreshProps();
  }
  setLabel(label) {
    this.label = label;
    this.refreshProps();
  }
  getProps() {
    const props = super.getProps();
    const { label, icon, shake } = this;
    props.label = label;
    props.icon = icon;
    props.shake = shake;
    return props;
  }
};
var FilterComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
    this.onUiChange = () => this.sourceParams.filterModifiedCallback();
    this.expectingNewMethods = true;
    this.hasBeenActive = false;
    this.awaitSetMethodsCallback = new AgPromise((resolve) => {
      this.resolveSetMethodsCallback = resolve;
    });
  }
  isFilterActive() {
    return this.model != null;
  }
  doesFilterPass(params) {
    return this.providedMethods.doesFilterPass(params);
  }
  getModel() {
    return this.model;
  }
  setModel(model) {
    this.expectingNewMethods = true;
    this.model = model;
    this.hasBeenActive || (this.hasBeenActive = this.isFilterActive());
    return this.refreshProps();
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
    return true;
  }
  afterGuiAttached(params) {
    const providedMethods = this.providedMethods;
    if (!providedMethods) {
      this.awaitSetMethodsCallback.then(() => this.providedMethods?.afterGuiAttached?.(params));
    } else {
      providedMethods.afterGuiAttached?.(params);
    }
  }
  getOptionalMethods() {
    return ["afterGuiDetached", "onNewRowsLoaded", "getModelAsString", "onAnyFilterChanged"];
  }
  setMethods(methods) {
    if (this.expectingNewMethods === false && this.hasBeenActive && this.providedMethods?.doesFilterPass !== methods?.doesFilterPass) {
      setTimeout(() => {
        this.sourceParams.filterChangedCallback();
      });
    }
    this.expectingNewMethods = false;
    super.setMethods(methods);
    this.resolveSetMethodsCallback();
    this.resolveFilterPassCallback?.();
    this.resolveFilterPassCallback = void 0;
  }
  updateModel(model) {
    this.resolveFilterPassCallback?.();
    const awaitFilterPassCallback = new AgPromise((resolve) => {
      this.resolveFilterPassCallback = resolve;
    });
    this.setModel(model).then(() => {
      awaitFilterPassCallback.then(() => {
        this.sourceParams.filterChangedCallback();
      });
    });
  }
  getProps() {
    const props = super.getProps();
    props.model = this.model;
    props.onModelChange = this.onModelChange;
    props.onUiChange = this.onUiChange;
    delete props.filterChangedCallback;
    return props;
  }
};
var FilterDisplayComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.awaitSetMethodsCallback = new AgPromise((resolve) => {
      this.resolveSetMethodsCallback = resolve;
    });
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
    return true;
  }
  afterGuiAttached(params) {
    const providedMethods = this.providedMethods;
    if (!providedMethods) {
      this.awaitSetMethodsCallback.then(() => this.providedMethods?.afterGuiAttached?.(params));
    } else {
      providedMethods.afterGuiAttached?.(params);
    }
  }
  getOptionalMethods() {
    return ["afterGuiDetached", "onNewRowsLoaded", "onAnyFilterChanged"];
  }
  setMethods(methods) {
    super.setMethods(methods);
    this.resolveSetMethodsCallback();
  }
};
function updateFloatingFilterParent(params, model) {
  params.parentFilterInstance((instance) => {
    (instance.setModel(model) || AgPromise.resolve()).then(() => {
      params.filterParams.filterChangedCallback();
    });
  });
}
var FloatingFilterComponentProxy = class {
  constructor(floatingFilterParams, refreshProps) {
    this.floatingFilterParams = floatingFilterParams;
    this.refreshProps = refreshProps;
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
  }
  getProps() {
    return {
      ...this.floatingFilterParams,
      model: this.model,
      onModelChange: this.onModelChange
    };
  }
  onParentModelChanged(parentModel) {
    this.model = parentModel;
    this.refreshProps();
  }
  refresh(params) {
    this.floatingFilterParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
  updateModel(model) {
    this.model = model;
    this.refreshProps();
    updateFloatingFilterParent(this.floatingFilterParams, model);
  }
};
var FloatingFilterComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.model = null;
    this.onModelChange = (model) => this.updateModel(model);
  }
  onParentModelChanged(parentModel) {
    this.model = parentModel;
    this.refreshProps();
  }
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
  updateModel(model) {
    this.model = model;
    this.refreshProps();
    updateFloatingFilterParent(this.sourceParams, model);
  }
  getProps() {
    const props = super.getProps();
    props.model = this.model;
    props.onModelChange = this.onModelChange;
    return props;
  }
};
var FloatingFilterDisplayComponentWrapper = class extends CustomComponentWrapper {
  refresh(newParams) {
    this.sourceParams = newParams;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
};
var InnerHeaderComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};
var MenuItemComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.active = false;
    this.expanded = false;
    this.onActiveChange = (active) => this.updateActive(active);
  }
  setActive(active) {
    this.awaitSetActive(active);
  }
  setExpanded(expanded) {
    this.expanded = expanded;
    this.refreshProps();
  }
  getOptionalMethods() {
    return ["select", "configureDefaults"];
  }
  awaitSetActive(active) {
    this.active = active;
    return this.refreshProps();
  }
  updateActive(active) {
    const result = this.awaitSetActive(active);
    if (active) {
      result.then(() => this.sourceParams.onItemActivated());
    }
  }
  getProps() {
    const props = super.getProps();
    props.active = this.active;
    props.expanded = this.expanded;
    props.onActiveChange = this.onActiveChange;
    delete props.onItemActivated;
    return props;
  }
};
var StatusPanelComponentWrapper = class extends CustomComponentWrapper {
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
};
var ToolPanelComponentWrapper = class extends CustomComponentWrapper {
  constructor() {
    super(...arguments);
    this.onStateChange = (state) => this.updateState(state);
  }
  refresh(params) {
    this.sourceParams = params;
    this.refreshProps();
    return true;
  }
  getState() {
    return this.state;
  }
  updateState(state) {
    this.state = state;
    this.refreshProps();
    this.sourceParams.onStateUpdated();
  }
  getProps() {
    const props = super.getProps();
    props.state = this.state;
    props.onStateChange = this.onStateChange;
    return props;
  }
};
function getInstance(wrapperComponent, callback) {
  const promise = wrapperComponent?.getInstance?.() ?? AgPromise.resolve(void 0);
  promise.then((comp) => callback(comp));
}
function warnReactiveCustomComponents() {
  _warn(231);
}
var MAX_COMPONENT_CREATION_TIME_IN_MS = 1e3;
var PortalManager = class {
  constructor(refresher, wrappingElement, maxComponentCreationTimeMs) {
    this.destroyed = false;
    this.portals = [];
    this.hasPendingPortalUpdate = false;
    this.wrappingElement = wrappingElement ? wrappingElement : "div";
    this.refresher = refresher;
    this.maxComponentCreationTimeMs = maxComponentCreationTimeMs ? maxComponentCreationTimeMs : MAX_COMPONENT_CREATION_TIME_IN_MS;
  }
  getPortals() {
    return this.portals;
  }
  destroy() {
    this.destroyed = true;
  }
  destroyPortal(portal) {
    this.portals = this.portals.filter((curPortal) => curPortal !== portal);
    this.batchUpdate();
  }
  getComponentWrappingElement() {
    return this.wrappingElement;
  }
  mountReactPortal(portal, reactComponent, resolve) {
    this.portals = [...this.portals, portal];
    this.waitForInstance(reactComponent, resolve);
    this.batchUpdate();
  }
  updateReactPortal(oldPortal, newPortal) {
    this.portals[this.portals.indexOf(oldPortal)] = newPortal;
    this.batchUpdate();
  }
  batchUpdate() {
    if (this.hasPendingPortalUpdate) {
      return;
    }
    setTimeout(() => {
      if (!this.destroyed) {
        this.refresher();
        this.hasPendingPortalUpdate = false;
      }
    });
    this.hasPendingPortalUpdate = true;
  }
  waitForInstance(reactComponent, resolve, startTime = Date.now()) {
    if (this.destroyed) {
      resolve(null);
      return;
    }
    if (reactComponent.rendered()) {
      resolve(reactComponent);
    } else {
      if (Date.now() - startTime >= this.maxComponentCreationTimeMs && !this.hasPendingPortalUpdate) {
        agFlushSync(true, () => this.refresher());
        if (reactComponent.rendered()) {
          resolve(reactComponent);
        }
        return;
      }
      window.setTimeout(() => {
        this.waitForInstance(reactComponent, resolve, startTime);
      });
    }
  }
};
var HeaderCellComp = ({ ctrl }) => {
  const isAlive = ctrl.isAlive();
  const { context } = (0, import_react14.useContext)(BeansContext);
  const [userCompDetails, setUserCompDetails] = (0, import_react14.useState)();
  const [userStyles, setUserStyles] = (0, import_react14.useState)();
  const compBean = (0, import_react14.useRef)();
  const eGui = (0, import_react14.useRef)(null);
  const eResize = (0, import_react14.useRef)(null);
  const eHeaderCompWrapper = (0, import_react14.useRef)(null);
  const userCompRef = (0, import_react14.useRef)();
  const cssManager = (0, import_react14.useRef)();
  if (isAlive && !cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const setRef2 = (0, import_react14.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new EmptyBean());
    const refreshSelectAllGui = () => {
      const selectAllGui = ctrl.getSelectAllGui();
      if (selectAllGui) {
        eResize.current?.insertAdjacentElement("afterend", selectAllGui);
        compBean.current.addDestroyFunc(() => selectAllGui.remove());
      }
    };
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setUserStyles: (styles) => setUserStyles(styles),
      setAriaSort: (sort) => {
        if (eGui.current) {
          sort ? _setAriaSort(eGui.current, sort) : _removeAriaSort(eGui.current);
        }
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getUserCompInstance: () => userCompRef.current || void 0,
      refreshSelectAllGui,
      removeSelectAllGui: () => ctrl.getSelectAllGui()?.remove()
    };
    ctrl.setComp(compProxy, eRef, eResize.current, eHeaderCompWrapper.current, compBean.current);
    refreshSelectAllGui();
  }, []);
  (0, import_react14.useLayoutEffect)(
    () => showJsComp(userCompDetails, context, eHeaderCompWrapper.current, userCompRef),
    [userCompDetails]
  );
  (0, import_react14.useEffect)(() => {
    ctrl.setDragSource(eGui.current);
  }, [userCompDetails]);
  const userCompStateless = (0, import_react14.useMemo)(() => {
    const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return import_react14.default.createElement("div", { ref: setRef2, style: userStyles, className: "ag-header-cell", role: "columnheader" }, import_react14.default.createElement("div", { ref: eResize, className: "ag-header-cell-resize", role: "presentation" }), import_react14.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp ? userCompStateless ? import_react14.default.createElement(UserCompClass, { ...userCompDetails.params }) : import_react14.default.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef }) : null));
};
var headerCellComp_default = (0, import_react14.memo)(HeaderCellComp);
var FloatingFilterDisplayComponentProxy = class {
  constructor(floatingFilterParams, refreshProps) {
    this.floatingFilterParams = floatingFilterParams;
    this.refreshProps = refreshProps;
  }
  getProps() {
    return this.floatingFilterParams;
  }
  refresh(params) {
    this.floatingFilterParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getOptionalMethods() {
    return ["afterGuiAttached"];
  }
};
var HeaderFilterCellComp = ({ ctrl }) => {
  const { context, gos } = (0, import_react15.useContext)(BeansContext);
  const [userStyles, setUserStyles] = (0, import_react15.useState)();
  const [cssClasses, setCssClasses] = (0, import_react15.useState)(
    () => new CssClasses("ag-header-cell", "ag-floating-filter")
  );
  const [cssBodyClasses, setBodyCssClasses] = (0, import_react15.useState)(() => new CssClasses());
  const [cssButtonWrapperClasses, setButtonWrapperCssClasses] = (0, import_react15.useState)(
    () => new CssClasses("ag-floating-filter-button", "ag-hidden")
  );
  const [buttonWrapperAriaHidden, setButtonWrapperAriaHidden] = (0, import_react15.useState)("false");
  const [userCompDetails, setUserCompDetails] = (0, import_react15.useState)();
  const [, setRenderKey] = (0, import_react15.useState)(1);
  const compBean = (0, import_react15.useRef)();
  const eGui = (0, import_react15.useRef)(null);
  const eFloatingFilterBody = (0, import_react15.useRef)(null);
  const eButtonWrapper = (0, import_react15.useRef)(null);
  const eButtonShowMainFilter = (0, import_react15.useRef)(null);
  const userCompResolve = (0, import_react15.useRef)();
  const userCompPromise = (0, import_react15.useRef)();
  const userCompRef = (value) => {
    if (value == null) {
      return;
    }
    userCompResolve.current && userCompResolve.current(value);
  };
  const setRef2 = (0, import_react15.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new EmptyBean());
    userCompPromise.current = new AgPromise((resolve) => {
      userCompResolve.current = resolve;
    });
    const compProxy = {
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setUserStyles: (styles) => setUserStyles(styles),
      addOrRemoveBodyCssClass: (name, on) => setBodyCssClasses((prev) => prev.setClass(name, on)),
      setButtonWrapperDisplayed: (displayed) => {
        setButtonWrapperCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setButtonWrapperAriaHidden(!displayed ? "true" : "false");
      },
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      setCompDetails: (compDetails) => setUserCompDetails(compDetails),
      getFloatingFilterComp: () => userCompPromise.current ? userCompPromise.current : null,
      setMenuIcon: (eIcon) => eButtonShowMainFilter.current?.appendChild(eIcon)
    };
    ctrl.setComp(compProxy, eRef, eButtonShowMainFilter.current, eFloatingFilterBody.current, compBean.current);
  }, []);
  (0, import_react15.useLayoutEffect)(
    () => showJsComp(userCompDetails, context, eFloatingFilterBody.current, userCompRef),
    [userCompDetails]
  );
  const className = (0, import_react15.useMemo)(() => cssClasses.toString(), [cssClasses]);
  const bodyClassName = (0, import_react15.useMemo)(() => cssBodyClasses.toString(), [cssBodyClasses]);
  const buttonWrapperClassName = (0, import_react15.useMemo)(() => cssButtonWrapperClasses.toString(), [cssButtonWrapperClasses]);
  const userCompStateless = (0, import_react15.useMemo)(() => {
    const res = userCompDetails && userCompDetails.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const reactiveCustomComponents = (0, import_react15.useMemo)(() => gos.get("reactiveCustomComponents"), []);
  const enableFilterHandlers = (0, import_react15.useMemo)(() => gos.get("enableFilterHandlers"), []);
  const [floatingFilterCompProxy, setFloatingFilterCompProxy] = (0, import_react15.useState)();
  (0, import_react15.useEffect)(() => {
    if (userCompDetails?.componentFromFramework) {
      if (reactiveCustomComponents) {
        const ProxyClass = enableFilterHandlers ? FloatingFilterDisplayComponentProxy : FloatingFilterComponentProxy;
        const compProxy = new ProxyClass(userCompDetails.params, () => setRenderKey((prev) => prev + 1));
        userCompRef(compProxy);
        setFloatingFilterCompProxy(compProxy);
      } else {
        warnReactiveCustomComponents();
      }
    }
  }, [userCompDetails]);
  const floatingFilterProps = floatingFilterCompProxy?.getProps();
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return import_react15.default.createElement("div", { ref: setRef2, style: userStyles, className, role: "gridcell" }, import_react15.default.createElement("div", { ref: eFloatingFilterBody, className: bodyClassName, role: "presentation" }, reactUserComp ? reactiveCustomComponents ? floatingFilterProps && import_react15.default.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => floatingFilterCompProxy.setMethods(methods)
      }
    },
    import_react15.default.createElement(UserCompClass, { ...floatingFilterProps })
  ) : import_react15.default.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompStateless ? () => {
  } : userCompRef }) : null), import_react15.default.createElement(
    "div",
    {
      ref: eButtonWrapper,
      "aria-hidden": buttonWrapperAriaHidden,
      className: buttonWrapperClassName,
      role: "presentation"
    },
    import_react15.default.createElement(
      "button",
      {
        ref: eButtonShowMainFilter,
        type: "button",
        className: "ag-button ag-floating-filter-button-button",
        tabIndex: -1
      }
    )
  ));
};
var headerFilterCellComp_default = (0, import_react15.memo)(HeaderFilterCellComp);
var HeaderGroupCellComp = ({ ctrl }) => {
  const { context } = (0, import_react16.useContext)(BeansContext);
  const [userStyles, setUserStyles] = (0, import_react16.useState)();
  const [cssClasses, setCssClasses] = (0, import_react16.useState)(() => new CssClasses());
  const [cssResizableClasses, setResizableCssClasses] = (0, import_react16.useState)(() => new CssClasses());
  const [resizableAriaHidden, setResizableAriaHidden] = (0, import_react16.useState)("false");
  const [ariaExpanded, setAriaExpanded] = (0, import_react16.useState)();
  const [userCompDetails, setUserCompDetails] = (0, import_react16.useState)();
  const compBean = (0, import_react16.useRef)();
  const eGui = (0, import_react16.useRef)(null);
  const eResize = (0, import_react16.useRef)(null);
  const eHeaderCompWrapper = (0, import_react16.useRef)(null);
  const userCompRef = (0, import_react16.useRef)();
  const setRef2 = (0, import_react16.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new EmptyBean());
    const compProxy = {
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setUserStyles: (styles) => setUserStyles(styles),
      setHeaderWrapperHidden: (hidden) => {
        const headerCompWrapper = eHeaderCompWrapper.current;
        if (!headerCompWrapper) {
          return;
        }
        if (hidden) {
          headerCompWrapper.style.setProperty("display", "none");
        } else {
          headerCompWrapper.style.removeProperty("display");
        }
      },
      setHeaderWrapperMaxHeight: (value) => {
        const headerCompWrapper = eHeaderCompWrapper.current;
        if (!headerCompWrapper) {
          return;
        }
        if (value != null) {
          headerCompWrapper.style.setProperty("max-height", `${value}px`);
        } else {
          headerCompWrapper.style.removeProperty("max-height");
        }
        headerCompWrapper.classList.toggle("ag-header-cell-comp-wrapper-limited-height", value != null);
      },
      setUserCompDetails: (compDetails) => setUserCompDetails(compDetails),
      setResizableDisplayed: (displayed) => {
        setResizableCssClasses((prev) => prev.setClass("ag-hidden", !displayed));
        setResizableAriaHidden(!displayed ? "true" : "false");
      },
      setAriaExpanded: (expanded) => setAriaExpanded(expanded),
      getUserCompInstance: () => userCompRef.current || void 0
    };
    ctrl.setComp(compProxy, eRef, eResize.current, eHeaderCompWrapper.current, compBean.current);
  }, []);
  (0, import_react16.useLayoutEffect)(() => showJsComp(userCompDetails, context, eHeaderCompWrapper.current), [userCompDetails]);
  (0, import_react16.useEffect)(() => {
    if (eGui.current) {
      ctrl.setDragSource(eGui.current);
    }
  }, [userCompDetails]);
  const userCompStateless = (0, import_react16.useMemo)(() => {
    const res = userCompDetails?.componentFromFramework && isComponentStateless(userCompDetails.componentClass);
    return !!res;
  }, [userCompDetails]);
  const className = (0, import_react16.useMemo)(() => "ag-header-group-cell " + cssClasses.toString(), [cssClasses]);
  const resizableClassName = (0, import_react16.useMemo)(
    () => "ag-header-cell-resize " + cssResizableClasses.toString(),
    [cssResizableClasses]
  );
  const reactUserComp = userCompDetails?.componentFromFramework;
  const UserCompClass = userCompDetails?.componentClass;
  return import_react16.default.createElement("div", { ref: setRef2, style: userStyles, className, role: "columnheader", "aria-expanded": ariaExpanded }, import_react16.default.createElement("div", { ref: eHeaderCompWrapper, className: "ag-header-cell-comp-wrapper", role: "presentation" }, reactUserComp ? userCompStateless ? import_react16.default.createElement(UserCompClass, { ...userCompDetails.params }) : import_react16.default.createElement(UserCompClass, { ...userCompDetails.params, ref: userCompRef }) : null), import_react16.default.createElement("div", { ref: eResize, "aria-hidden": resizableAriaHidden, className: resizableClassName }));
};
var headerGroupCellComp_default = (0, import_react16.memo)(HeaderGroupCellComp);
var HeaderRowComp = ({ ctrl }) => {
  const { gos, context } = (0, import_react13.useContext)(BeansContext);
  const { topOffset, rowHeight } = (0, import_react13.useMemo)(() => ctrl.getTopAndHeight(), []);
  const tabIndex = (0, import_react13.useMemo)(() => gos.get("tabIndex"), []);
  const [ariaRowIndex, setAriaRowIndex] = (0, import_react13.useState)(() => ctrl.getAriaRowIndex());
  const className = ctrl.headerRowClass;
  const [height, setHeight] = (0, import_react13.useState)(() => rowHeight + "px");
  const [top, setTop] = (0, import_react13.useState)(() => topOffset + "px");
  const cellCtrlsRef = (0, import_react13.useRef)(null);
  const [cellCtrls, setCellCtrls] = (0, import_react13.useState)(() => ctrl.getUpdatedHeaderCtrls());
  const compBean = (0, import_react13.useRef)();
  const eGui = (0, import_react13.useRef)(null);
  const setRef2 = (0, import_react13.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || !ctrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new EmptyBean());
    const compProxy = {
      setHeight: (height2) => setHeight(height2),
      setTop: (top2) => setTop(top2),
      setHeaderCtrls: (ctrls, forceOrder, afterScroll) => {
        const prevCellCtrls = cellCtrlsRef.current;
        const nextCells = getNextValueIfDifferent(prevCellCtrls, ctrls, forceOrder);
        if (nextCells !== prevCellCtrls) {
          cellCtrlsRef.current = nextCells;
          agFlushSync(afterScroll, () => setCellCtrls(nextCells));
        }
      },
      setWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
        }
      },
      setRowIndex: (rowIndex) => {
        setAriaRowIndex(rowIndex);
      }
    };
    ctrl.setComp(compProxy, compBean.current, false);
  }, []);
  const style = (0, import_react13.useMemo)(
    () => ({
      height,
      top
    }),
    [height, top]
  );
  const createCellJsx = (0, import_react13.useCallback)((cellCtrl) => {
    switch (ctrl.type) {
      case "group":
        return import_react13.default.createElement(headerGroupCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
      case "filter":
        return import_react13.default.createElement(headerFilterCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
      default:
        return import_react13.default.createElement(headerCellComp_default, { ctrl: cellCtrl, key: cellCtrl.instanceId });
    }
  }, []);
  return import_react13.default.createElement(
    "div",
    {
      ref: setRef2,
      className,
      role: "row",
      style,
      tabIndex,
      "aria-rowindex": ariaRowIndex
    },
    cellCtrls.map(createCellJsx)
  );
};
var headerRowComp_default = (0, import_react13.memo)(HeaderRowComp);
var HeaderRowContainerComp = ({ pinned }) => {
  const [displayed, setDisplayed] = (0, import_react12.useState)(true);
  const [headerRowCtrls, setHeaderRowCtrls] = (0, import_react12.useState)([]);
  const { context } = (0, import_react12.useContext)(BeansContext);
  const eGui = (0, import_react12.useRef)(null);
  const eCenterContainer = (0, import_react12.useRef)(null);
  const headerRowCtrlRef = (0, import_react12.useRef)();
  const pinnedLeft = pinned === "left";
  const pinnedRight = pinned === "right";
  const centre = !pinnedLeft && !pinnedRight;
  const setRef2 = (0, import_react12.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || context.isDestroyed()) {
      headerRowCtrlRef.current = context.destroyBean(headerRowCtrlRef.current);
      return;
    }
    headerRowCtrlRef.current = context.createBean(new HeaderRowContainerCtrl(pinned));
    const compProxy = {
      setDisplayed,
      setCtrls: (ctrls) => setHeaderRowCtrls(ctrls),
      // centre only
      setCenterWidth: (width) => {
        if (eCenterContainer.current) {
          eCenterContainer.current.style.width = width;
        }
      },
      setViewportScrollLeft: (left) => {
        if (eGui.current) {
          eGui.current.scrollLeft = left;
        }
      },
      // pinned only
      setPinnedContainerWidth: (width) => {
        if (eGui.current) {
          eGui.current.style.width = width;
          eGui.current.style.minWidth = width;
          eGui.current.style.maxWidth = width;
        }
      }
    };
    headerRowCtrlRef.current.setComp(compProxy, eGui.current);
  }, []);
  const className = !displayed ? "ag-hidden" : "";
  const insertRowsJsx = () => headerRowCtrls.map((ctrl) => import_react12.default.createElement(headerRowComp_default, { ctrl, key: ctrl.instanceId }));
  return pinnedLeft ? import_react12.default.createElement("div", { ref: setRef2, className: "ag-pinned-left-header " + className, "aria-hidden": !displayed, role: "rowgroup" }, insertRowsJsx()) : pinnedRight ? import_react12.default.createElement("div", { ref: setRef2, className: "ag-pinned-right-header " + className, "aria-hidden": !displayed, role: "rowgroup" }, insertRowsJsx()) : centre ? import_react12.default.createElement("div", { ref: setRef2, className: "ag-header-viewport " + className, role: "rowgroup", tabIndex: -1 }, import_react12.default.createElement("div", { ref: eCenterContainer, className: "ag-header-container", role: "presentation" }, insertRowsJsx())) : null;
};
var headerRowContainerComp_default = (0, import_react12.memo)(HeaderRowContainerComp);
var GridHeaderComp = () => {
  const [cssClasses, setCssClasses] = (0, import_react11.useState)(() => new CssClasses());
  const [height, setHeight] = (0, import_react11.useState)();
  const { context } = (0, import_react11.useContext)(BeansContext);
  const eGui = (0, import_react11.useRef)(null);
  const gridCtrlRef = (0, import_react11.useRef)();
  const setRef2 = (0, import_react11.useCallback)((eRef) => {
    eGui.current = eRef;
    if (!eRef || context.isDestroyed()) {
      gridCtrlRef.current = context.destroyBean(gridCtrlRef.current);
      return;
    }
    gridCtrlRef.current = context.createBean(new GridHeaderCtrl());
    const compProxy = {
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      setHeightAndMinHeight: (height2) => setHeight(height2)
    };
    gridCtrlRef.current.setComp(compProxy, eRef, eRef);
  }, []);
  const className = (0, import_react11.useMemo)(() => {
    const res = cssClasses.toString();
    return "ag-header " + res;
  }, [cssClasses]);
  const style = (0, import_react11.useMemo)(
    () => ({
      height,
      minHeight: height
    }),
    [height]
  );
  return import_react11.default.createElement("div", { ref: setRef2, className, style, role: "presentation" }, import_react11.default.createElement(headerRowContainerComp_default, { pinned: "left" }), import_react11.default.createElement(headerRowContainerComp_default, { pinned: null }), import_react11.default.createElement(headerRowContainerComp_default, { pinned: "right" }));
};
var gridHeaderComp_default = (0, import_react11.memo)(GridHeaderComp);
var useReactCommentEffect = (comment, eForCommentRef) => {
  (0, import_react17.useEffect)(() => {
    const eForComment = eForCommentRef.current;
    if (eForComment) {
      const eParent = eForComment.parentElement;
      if (eParent) {
        const eComment = document.createComment(comment);
        eParent.insertBefore(eComment, eForComment);
        return () => {
          eComment.remove();
        };
      }
    }
  }, [comment]);
};
var reactComment_default = useReactCommentEffect;
var CellEditorComponentProxy = class {
  constructor(cellEditorParams, refreshProps) {
    this.cellEditorParams = cellEditorParams;
    this.refreshProps = refreshProps;
    this.instanceCreated = new AgPromise((resolve) => {
      this.resolveInstanceCreated = resolve;
    });
    this.onValueChange = (value) => this.updateValue(value);
    this.value = cellEditorParams.value;
  }
  getProps() {
    return {
      ...this.cellEditorParams,
      initialValue: this.cellEditorParams.value,
      value: this.value,
      onValueChange: this.onValueChange
    };
  }
  getValue() {
    return this.value;
  }
  refresh(params) {
    this.cellEditorParams = params;
    this.refreshProps();
  }
  setMethods(methods) {
    addOptionalMethods(this.getOptionalMethods(), methods, this);
  }
  getInstance() {
    return this.instanceCreated.then(() => this.componentInstance);
  }
  setRef(componentInstance) {
    this.componentInstance = componentInstance;
    this.resolveInstanceCreated?.();
    this.resolveInstanceCreated = void 0;
  }
  getOptionalMethods() {
    return [
      "isCancelBeforeStart",
      "isCancelAfterEnd",
      "focusIn",
      "focusOut",
      "afterGuiAttached",
      "getValidationErrors",
      "getValidationElement"
    ];
  }
  updateValue(value) {
    this.value = value;
    this.refreshProps();
  }
};
var useEffectOnce = (effect) => {
  const effectFn = (0, import_react23.useRef)(effect);
  const destroyFn = (0, import_react23.useRef)();
  const effectCalled = (0, import_react23.useRef)(false);
  const rendered = (0, import_react23.useRef)(false);
  const [, setVal] = (0, import_react23.useState)(0);
  if (effectCalled.current) {
    rendered.current = true;
  }
  (0, import_react23.useEffect)(() => {
    if (!effectCalled.current) {
      destroyFn.current = effectFn.current();
      effectCalled.current = true;
    }
    setVal((val) => val + 1);
    return () => {
      if (!rendered.current) {
        return;
      }
      destroyFn.current?.();
    };
  }, []);
};
var PopupEditorComp = (props) => {
  const [popupEditorWrapper, setPopupEditorWrapper] = (0, import_react22.useState)();
  const beans = (0, import_react22.useContext)(BeansContext);
  const { context, popupSvc, gos, editSvc } = beans;
  const { editDetails, cellCtrl, eParentCell } = props;
  useEffectOnce(() => {
    const { compDetails } = editDetails;
    const useModelPopup = gos.get("stopEditingWhenCellsLoseFocus");
    let hideEditorPopup = void 0;
    let wrapper;
    if (!context.isDestroyed()) {
      wrapper = context.createBean(editSvc.createPopupEditorWrapper(compDetails.params));
      const ePopupGui = wrapper.getGui();
      if (props.jsChildComp) {
        const eChildGui = props.jsChildComp.getGui();
        if (eChildGui) {
          ePopupGui.appendChild(eChildGui);
        }
      }
      const { column, rowNode } = cellCtrl;
      const positionParams = {
        column,
        rowNode,
        type: "popupCellEditor",
        eventSource: eParentCell,
        ePopup: ePopupGui,
        position: editDetails.popupPosition,
        keepWithinBounds: true
      };
      const positionCallback = popupSvc?.positionPopupByComponent.bind(popupSvc, positionParams);
      const addPopupRes = popupSvc?.addPopup({
        modal: useModelPopup,
        eChild: ePopupGui,
        closeOnEsc: true,
        closedCallback: () => {
          cellCtrl.onPopupEditorClosed();
        },
        anchorToElement: eParentCell,
        positionCallback,
        ariaOwns: eParentCell
      });
      hideEditorPopup = addPopupRes ? addPopupRes.hideFunc : void 0;
      setPopupEditorWrapper(wrapper);
      props.jsChildComp?.afterGuiAttached?.();
    }
    return () => {
      hideEditorPopup?.();
      context.destroyBean(wrapper);
    };
  });
  (0, import_react22.useLayoutEffect)(() => {
    return () => {
      if (cellCtrl.isCellFocused() && popupEditorWrapper?.getGui().contains(_getActiveDomElement(beans))) {
        eParentCell.focus({ preventScroll: true });
      }
    };
  }, [popupEditorWrapper]);
  return popupEditorWrapper && props.wrappedContent ? (0, import_react_dom3.createPortal)(props.wrappedContent, popupEditorWrapper.getGui()) : null;
};
var popupEditorComp_default = (0, import_react22.memo)(PopupEditorComp);
var jsxEditorProxy = (editDetails, CellEditorClass, setRef2) => {
  const { compProxy } = editDetails;
  setRef2(compProxy);
  const props = compProxy.getProps();
  const isStateless = isComponentStateless(CellEditorClass);
  return import_react21.default.createElement(
    CustomContext.Provider,
    {
      value: {
        setMethods: (methods) => compProxy.setMethods(methods)
      }
    },
    isStateless ? import_react21.default.createElement(CellEditorClass, { ...props }) : import_react21.default.createElement(CellEditorClass, { ...props, ref: (ref) => compProxy.setRef(ref) })
  );
};
var jsxEditor = (editDetails, CellEditorClass, setRef2) => {
  const newFormat = editDetails.compProxy;
  return newFormat ? jsxEditorProxy(editDetails, CellEditorClass, setRef2) : import_react21.default.createElement(CellEditorClass, { ...editDetails.compDetails.params, ref: setRef2 });
};
var jsxEditValue = (editDetails, setCellEditorRef, eGui, cellCtrl, jsEditorComp) => {
  const compDetails = editDetails.compDetails;
  const CellEditorClass = compDetails.componentClass;
  const reactInlineEditor = compDetails.componentFromFramework && !editDetails.popup;
  const reactPopupEditor = compDetails.componentFromFramework && editDetails.popup;
  const jsPopupEditor = !compDetails.componentFromFramework && editDetails.popup;
  return reactInlineEditor ? jsxEditor(editDetails, CellEditorClass, setCellEditorRef) : reactPopupEditor ? import_react21.default.createElement(
    popupEditorComp_default,
    {
      editDetails,
      cellCtrl,
      eParentCell: eGui,
      wrappedContent: jsxEditor(editDetails, CellEditorClass, setCellEditorRef)
    }
  ) : jsPopupEditor && jsEditorComp ? import_react21.default.createElement(popupEditorComp_default, { editDetails, cellCtrl, eParentCell: eGui, jsChildComp: jsEditorComp }) : null;
};
var useJsCellRenderer = (showDetails, showTools, eCellValue, cellValueVersion, jsCellRendererRef, eGui, suppressInlineEditRenderer = false) => {
  const { context } = (0, import_react24.useContext)(BeansContext);
  const destroyCellRenderer = (0, import_react24.useCallback)(() => {
    const comp = jsCellRendererRef.current;
    if (!comp) {
      return;
    }
    const compGui = comp.getGui();
    if (compGui && compGui.parentElement) {
      compGui.remove();
    }
    context.destroyBean(comp);
    jsCellRendererRef.current = void 0;
  }, []);
  (0, import_react24.useEffect)(() => {
    const showValue = showDetails != null && !suppressInlineEditRenderer;
    const jsCompDetails = showDetails?.compDetails && !showDetails.compDetails.componentFromFramework;
    const waitingForToolsSetup = showTools && eCellValue == null;
    const showComp = showValue && jsCompDetails && !waitingForToolsSetup;
    if (!showComp) {
      destroyCellRenderer();
      return;
    }
    const compDetails = showDetails.compDetails;
    if (jsCellRendererRef.current) {
      const comp = jsCellRendererRef.current;
      const attemptRefresh = comp.refresh != null && showDetails.force == false;
      const refreshResult = attemptRefresh ? comp.refresh(compDetails.params) : false;
      const refreshWorked = refreshResult === true || refreshResult === void 0;
      if (refreshWorked) {
        return;
      }
      destroyCellRenderer();
    }
    const promise = compDetails.newAgStackInstance();
    promise.then((comp) => {
      if (!comp) {
        return;
      }
      const compGui = comp.getGui();
      if (!compGui) {
        return;
      }
      const parent = showTools ? eCellValue : eGui.current;
      parent.appendChild(compGui);
      jsCellRendererRef.current = comp;
    });
  }, [showDetails, showTools, cellValueVersion, suppressInlineEditRenderer]);
  (0, import_react24.useEffect)(() => {
    return destroyCellRenderer;
  }, []);
};
var showJsRenderer_default = useJsCellRenderer;
var SkeletonCellRenderer = ({
  cellCtrl,
  parent
}) => {
  const jsCellRendererRef = (0, import_react25.useRef)();
  const renderDetails = (0, import_react25.useMemo)(() => {
    const { loadingComp } = cellCtrl.getDeferLoadingCellRenderer();
    return loadingComp ? {
      value: void 0,
      compDetails: loadingComp,
      force: false
    } : void 0;
  }, [cellCtrl]);
  showJsRenderer_default(renderDetails, false, void 0, 1, jsCellRendererRef, parent);
  if (renderDetails?.compDetails?.componentFromFramework) {
    const CellRendererClass = renderDetails.compDetails.componentClass;
    return import_react25.default.createElement(CellRendererClass, { ...renderDetails.compDetails.params });
  }
  return import_react25.default.createElement(import_react25.default.Fragment, null);
};
var CellComp = ({
  cellCtrl,
  printLayout,
  editingCell
}) => {
  const beans = (0, import_react20.useContext)(BeansContext);
  const { context } = beans;
  const {
    column: { colIdSanitised },
    instanceId
  } = cellCtrl;
  const compBean = (0, import_react20.useRef)();
  const [renderDetails, setRenderDetails] = (0, import_react20.useState)(
    () => cellCtrl.isCellRenderer() ? void 0 : { compDetails: void 0, value: cellCtrl.getValueToDisplay(), force: false }
  );
  const [editDetails, setEditDetails] = (0, import_react20.useState)();
  const [renderKey, setRenderKey] = (0, import_react20.useState)(1);
  const [userStyles, setUserStyles] = (0, import_react20.useState)();
  const [includeSelection, setIncludeSelection] = (0, import_react20.useState)(false);
  const [includeRowDrag, setIncludeRowDrag] = (0, import_react20.useState)(false);
  const [includeDndSource, setIncludeDndSource] = (0, import_react20.useState)(false);
  const [jsEditorComp, setJsEditorComp] = (0, import_react20.useState)();
  const forceWrapper = (0, import_react20.useMemo)(() => cellCtrl.isForceWrapper(), [cellCtrl]);
  const cellAriaRole = (0, import_react20.useMemo)(() => cellCtrl.getCellAriaRole(), [cellCtrl]);
  const eGui = (0, import_react20.useRef)(null);
  const eWrapper = (0, import_react20.useRef)(null);
  const cellRendererRef = (0, import_react20.useRef)(null);
  const jsCellRendererRef = (0, import_react20.useRef)();
  const cellEditorRef = (0, import_react20.useRef)();
  const eCellWrapper = (0, import_react20.useRef)();
  const cellWrapperDestroyFuncs = (0, import_react20.useRef)([]);
  const rowDragCompRef = (0, import_react20.useRef)();
  const eCellValue = (0, import_react20.useRef)();
  const [cellValueVersion, setCellValueVersion] = (0, import_react20.useState)(0);
  const setCellValueRef = (0, import_react20.useCallback)((ref) => {
    eCellValue.current = ref;
    setCellValueVersion((v) => v + 1);
  }, []);
  const showTools = renderDetails != null && (includeSelection || includeDndSource || includeRowDrag) && (editDetails == null || !!editDetails.popup);
  const showCellWrapper = forceWrapper || showTools;
  const cellValueClass = (0, import_react20.useMemo)(() => {
    return cellCtrl.getCellValueClass();
  }, [cellCtrl]);
  const setCellEditorRef = (0, import_react20.useCallback)(
    (cellEditor) => {
      cellEditorRef.current = cellEditor;
      if (cellEditor) {
        const editingCancelledByUserComp = cellEditor.isCancelBeforeStart && cellEditor.isCancelBeforeStart();
        setTimeout(() => {
          if (editingCancelledByUserComp) {
            cellCtrl.stopEditing(true);
            cellCtrl.focusCell(true);
          } else {
            cellCtrl.cellEditorAttached();
            cellCtrl.enableEditorTooltipFeature(cellEditor);
          }
        });
      }
    },
    [cellCtrl]
  );
  const cssManager = (0, import_react20.useRef)();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const suppressJsRenderer = !!editDetails && !editDetails.popup;
  showJsRenderer_default(
    renderDetails,
    showCellWrapper,
    eCellValue.current,
    cellValueVersion,
    jsCellRendererRef,
    eGui,
    suppressJsRenderer
  );
  const lastRenderDetails = (0, import_react20.useRef)();
  (0, import_react20.useLayoutEffect)(() => {
    const oldDetails = lastRenderDetails.current;
    const newDetails = renderDetails;
    lastRenderDetails.current = renderDetails;
    if (oldDetails == null || oldDetails.compDetails == null || newDetails == null || newDetails.compDetails == null) {
      return;
    }
    rowDragCompRef.current?.refreshVisibility();
    const oldCompDetails = oldDetails.compDetails;
    const newCompDetails = newDetails.compDetails;
    if (oldCompDetails.componentClass != newCompDetails.componentClass) {
      return;
    }
    if (cellRendererRef.current?.refresh == null) {
      return;
    }
    const result = cellRendererRef.current.refresh(newCompDetails.params);
    if (result != true) {
      setRenderKey((prev) => prev + 1);
    }
  }, [renderDetails]);
  (0, import_react20.useLayoutEffect)(() => {
    const doingJsEditor = editDetails && !editDetails.compDetails.componentFromFramework;
    if (!doingJsEditor || context.isDestroyed()) {
      return;
    }
    const compDetails = editDetails.compDetails;
    const isPopup = editDetails.popup === true;
    const cellEditorPromise = compDetails.newAgStackInstance();
    cellEditorPromise.then((cellEditor) => {
      if (!cellEditor) {
        return;
      }
      const compGui = cellEditor.getGui();
      setCellEditorRef(cellEditor);
      if (!isPopup) {
        const parentEl = (forceWrapper ? eCellWrapper : eGui).current;
        parentEl?.appendChild(compGui);
        cellEditor.afterGuiAttached?.();
      }
      setJsEditorComp(cellEditor);
    });
    return () => {
      cellEditorPromise.then((cellEditor) => {
        const compGui = cellEditor.getGui();
        cellCtrl.disableEditorTooltipFeature();
        context.destroyBean(cellEditor);
        setCellEditorRef(void 0);
        setJsEditorComp(void 0);
        compGui?.remove();
      });
    };
  }, [editDetails]);
  const setCellWrapperRef = (0, import_react20.useCallback)(
    (eRef) => {
      eCellWrapper.current = eRef;
      if (!eRef || context.isDestroyed() || !cellCtrl.isAlive()) {
        const callbacks = cellWrapperDestroyFuncs.current;
        cellWrapperDestroyFuncs.current = [];
        for (const cb of callbacks) {
          cb();
        }
        return;
      }
      let rowDragComp;
      const addComp = (comp) => {
        if (comp) {
          eRef.insertAdjacentElement("afterbegin", comp.getGui());
          cellWrapperDestroyFuncs.current.push(() => {
            _removeFromParent(comp.getGui());
            context.destroyBean(comp);
            if (rowDragCompRef.current === rowDragComp) {
              rowDragCompRef.current = void 0;
            }
          });
        }
      };
      if (includeSelection) {
        addComp(cellCtrl.createSelectionCheckbox());
      }
      if (includeDndSource) {
        addComp(cellCtrl.createDndSource());
      }
      if (includeRowDrag) {
        rowDragComp = cellCtrl.createRowDragComp();
        rowDragCompRef.current = rowDragComp;
        if (rowDragComp) {
          addComp(rowDragComp);
          rowDragComp.refreshVisibility();
        }
      }
    },
    [cellCtrl, context, includeDndSource, includeRowDrag, includeSelection]
  );
  const init = (0, import_react20.useCallback)(() => {
    const spanReady = !cellCtrl.isCellSpanning() || eWrapper.current;
    const eRef = eGui.current;
    if (!eRef || !spanReady || !cellCtrl || !cellCtrl.isAlive() || context.isDestroyed()) {
      compBean.current = context.destroyBean(compBean.current);
      return;
    }
    compBean.current = context.createBean(new EmptyBean());
    const compProxy = {
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setUserStyles: (styles) => setUserStyles(styles),
      getFocusableElement: () => eGui.current,
      setIncludeSelection: (include) => setIncludeSelection(include),
      setIncludeRowDrag: (include) => setIncludeRowDrag(include),
      setIncludeDndSource: (include) => setIncludeDndSource(include),
      getCellEditor: () => cellEditorRef.current ?? null,
      getCellRenderer: () => cellRendererRef.current ?? jsCellRendererRef.current,
      getParentOfValue: () => eCellValue.current ?? eCellWrapper.current ?? eGui.current,
      setRenderDetails: (compDetails, value, force) => {
        const setDetails = () => {
          setRenderDetails((prev) => {
            if (prev?.compDetails !== compDetails || prev?.value !== value || prev?.force !== force) {
              return {
                value,
                compDetails,
                force
              };
            } else {
              return prev;
            }
          });
        };
        if (compDetails?.params?.deferRender && !cellCtrl.rowNode.group) {
          const { loadingComp, onReady } = cellCtrl.getDeferLoadingCellRenderer();
          if (loadingComp) {
            setRenderDetails({
              value: void 0,
              compDetails: loadingComp,
              force: false
            });
            onReady.then(() => agStartTransition(setDetails));
            return;
          }
        }
        setDetails();
      },
      setEditDetails: (compDetails, popup, popupPosition, reactiveCustomComponents) => {
        if (compDetails) {
          let compProxy2 = void 0;
          if (compDetails.componentFromFramework) {
            if (reactiveCustomComponents) {
              compProxy2 = new CellEditorComponentProxy(
                compDetails.params,
                () => setRenderKey((prev) => prev + 1)
              );
            } else {
              warnReactiveCustomComponents();
            }
          }
          setEditDetails({
            compDetails,
            popup,
            popupPosition,
            compProxy: compProxy2
          });
          if (!popup) {
            setRenderDetails(void 0);
          }
        } else {
          const recoverFocus = cellCtrl.hasBrowserFocus();
          if (recoverFocus) {
            compProxy.getFocusableElement().focus({ preventScroll: true });
          }
          cellEditorRef.current = void 0;
          setEditDetails(void 0);
        }
      },
      refreshEditStyles: (editing, isPopup) => {
        if (!eGui.current) {
          return;
        }
        const { current } = cssManager;
        current.toggleCss("ag-cell-value", !showCellWrapper);
        current.toggleCss("ag-cell-inline-editing", !!editing && !isPopup);
        current.toggleCss("ag-cell-popup-editing", !!editing && !!isPopup);
        current.toggleCss("ag-cell-not-inline-editing", !editing || !!isPopup);
      }
    };
    const cellWrapperOrUndefined = eCellWrapper.current || void 0;
    cellCtrl.setComp(
      compProxy,
      eRef,
      eWrapper.current ?? void 0,
      cellWrapperOrUndefined,
      printLayout,
      editingCell,
      compBean.current
    );
  }, []);
  const setGuiRef = (0, import_react20.useCallback)((ref) => {
    eGui.current = ref;
    init();
  }, []);
  const setWrapperRef = (0, import_react20.useCallback)((ref) => {
    eWrapper.current = ref;
    init();
  }, []);
  const reactCellRendererStateless = (0, import_react20.useMemo)(() => {
    const res = renderDetails?.compDetails?.componentFromFramework && isComponentStateless(renderDetails.compDetails.componentClass);
    return !!res;
  }, [renderDetails]);
  (0, import_react20.useLayoutEffect)(() => {
    if (!eGui.current) {
      return;
    }
    const { current } = cssManager;
    current.toggleCss("ag-cell-value", !showCellWrapper);
    current.toggleCss("ag-cell-inline-editing", !!editDetails && !editDetails.popup);
    current.toggleCss("ag-cell-popup-editing", !!editDetails && !!editDetails.popup);
    current.toggleCss("ag-cell-not-inline-editing", !editDetails || !!editDetails.popup);
  });
  const valueOrCellComp = () => {
    const { compDetails, value } = renderDetails;
    if (!compDetails) {
      return value?.toString?.() ?? value;
    }
    if (compDetails.componentFromFramework) {
      const CellRendererClass = compDetails.componentClass;
      return import_react20.default.createElement(import_react20.Suspense, { fallback: import_react20.default.createElement(SkeletonCellRenderer, { cellCtrl, parent: eGui }) }, reactCellRendererStateless ? import_react20.default.createElement(CellRendererClass, { ...compDetails.params, key: renderKey }) : import_react20.default.createElement(CellRendererClass, { ...compDetails.params, key: renderKey, ref: cellRendererRef }));
    }
  };
  const showCellOrEditor = () => {
    const showCellValue = () => {
      if (renderDetails == null) {
        return null;
      }
      return showCellWrapper ? import_react20.default.createElement("span", { role: "presentation", id: `cell-${instanceId}`, className: cellValueClass, ref: setCellValueRef }, valueOrCellComp()) : valueOrCellComp();
    };
    const showEditValue = (details) => jsxEditValue(details, setCellEditorRef, eGui.current, cellCtrl, jsEditorComp);
    if (editDetails != null) {
      if (editDetails.popup) {
        return import_react20.default.createElement(import_react20.default.Fragment, null, showCellValue(), showEditValue(editDetails));
      }
      return showEditValue(editDetails);
    }
    return showCellValue();
  };
  const renderCell = () => import_react20.default.createElement("div", { ref: setGuiRef, style: userStyles, role: cellAriaRole, "col-id": colIdSanitised }, showCellWrapper ? import_react20.default.createElement("div", { className: "ag-cell-wrapper", role: "presentation", ref: setCellWrapperRef }, showCellOrEditor()) : showCellOrEditor());
  if (cellCtrl.isCellSpanning()) {
    return import_react20.default.createElement("div", { ref: setWrapperRef, className: "ag-spanned-cell-wrapper", role: "presentation" }, renderCell());
  }
  return renderCell();
};
var cellComp_default = (0, import_react20.memo)(CellComp);
var RowComp = ({ rowCtrl, containerType }) => {
  const { context, gos, editSvc } = (0, import_react19.useContext)(BeansContext);
  const enableUses = (0, import_react19.useContext)(RenderModeContext) === "default";
  const compBean = (0, import_react19.useRef)();
  const domOrderRef = (0, import_react19.useRef)(rowCtrl.getDomOrder());
  const isFullWidth = rowCtrl.isFullWidth();
  const isDisplayed = rowCtrl.rowNode.displayed;
  const [rowIndex, setRowIndex] = (0, import_react19.useState)(
    () => isDisplayed ? rowCtrl.rowNode.getRowIndexString() : null
  );
  const [rowId, setRowId] = (0, import_react19.useState)(() => rowCtrl.rowId);
  const [rowBusinessKey, setRowBusinessKey] = (0, import_react19.useState)(() => rowCtrl.businessKey);
  const [userStyles, setUserStyles] = (0, import_react19.useState)(() => rowCtrl.rowStyles);
  const cellCtrlsRef = (0, import_react19.useRef)(null);
  const [cellCtrlsFlushSync, setCellCtrlsFlushSync] = (0, import_react19.useState)(() => null);
  const [fullWidthCompDetails, setFullWidthCompDetails] = (0, import_react19.useState)();
  const [top, setTop] = (0, import_react19.useState)(
    () => isDisplayed ? rowCtrl.getInitialRowTop(containerType) : void 0
  );
  const [transform, setTransform] = (0, import_react19.useState)(
    () => isDisplayed ? rowCtrl.getInitialTransform(containerType) : void 0
  );
  const eGui = (0, import_react19.useRef)(null);
  const fullWidthCompRef = (0, import_react19.useRef)();
  const fullWidthParamsRef = (0, import_react19.useRef)();
  const autoHeightSetup = (0, import_react19.useRef)(false);
  const [autoHeightSetupAttempt, setAutoHeightSetupAttempt] = (0, import_react19.useState)(0);
  (0, import_react19.useEffect)(() => {
    if (autoHeightSetup.current || !fullWidthCompDetails || autoHeightSetupAttempt > 10) {
      return;
    }
    const eChild = eGui.current?.firstChild;
    if (eChild) {
      rowCtrl.setupDetailRowAutoHeight(eChild);
      autoHeightSetup.current = true;
    } else {
      setAutoHeightSetupAttempt((prev) => prev + 1);
    }
  }, [fullWidthCompDetails, autoHeightSetupAttempt]);
  const cssManager = (0, import_react19.useRef)();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eGui.current);
  }
  const cellsChanged = (0, import_react19.useRef)(() => {
  });
  const sub = (0, import_react19.useCallback)((onStoreChange) => {
    cellsChanged.current = onStoreChange;
    return () => {
      cellsChanged.current = () => {
      };
    };
  }, []);
  const cellCtrlsUses = agUseSyncExternalStore(
    sub,
    () => {
      return cellCtrlsRef.current;
    },
    []
  );
  const cellCtrlsMerged = enableUses ? cellCtrlsUses : cellCtrlsFlushSync;
  const setRef2 = (0, import_react19.useCallback)((eRef) => {
    eGui.current = eRef;
    compBean.current = eRef ? context.createBean(new EmptyBean()) : context.destroyBean(compBean.current);
    if (!eRef) {
      rowCtrl.unsetComp(containerType);
      return;
    }
    if (!rowCtrl.isAlive() || context.isDestroyed()) {
      return;
    }
    const compProxy = {
      // the rowTop is managed by state, instead of direct style manipulation by rowCtrl (like all the other styles)
      // as we need to have an initial value when it's placed into he DOM for the first time, for animation to work.
      setTop,
      setTransform,
      // i found using React for managing classes at the row level was to slow, as modifying classes caused a lot of
      // React code to execute, so avoiding React for managing CSS Classes made the grid go much faster.
      toggleCss: (name, on) => cssManager.current.toggleCss(name, on),
      setDomOrder: (domOrder) => domOrderRef.current = domOrder,
      setRowIndex,
      setRowId,
      setRowBusinessKey,
      setUserStyles,
      // if we don't maintain the order, then cols will be ripped out and into the dom
      // when cols reordered, which would stop the CSS transitions from working
      setCellCtrls: (next, useFlushSync) => {
        const prevCellCtrls = cellCtrlsRef.current;
        const nextCells = getNextValueIfDifferent(prevCellCtrls, next, domOrderRef.current);
        if (nextCells !== prevCellCtrls) {
          cellCtrlsRef.current = nextCells;
          if (enableUses) {
            cellsChanged.current();
          } else {
            agFlushSync(useFlushSync, () => setCellCtrlsFlushSync(nextCells));
          }
        }
      },
      showFullWidth: (compDetails) => {
        fullWidthParamsRef.current = compDetails.params;
        setFullWidthCompDetails(compDetails);
      },
      getFullWidthCellRenderer: () => fullWidthCompRef.current,
      getFullWidthCellRendererParams: () => fullWidthParamsRef.current,
      refreshFullWidth: (getUpdatedParams) => {
        const fullWidthParams = getUpdatedParams();
        fullWidthParamsRef.current = fullWidthParams;
        if (canRefreshFullWidthRef.current) {
          setFullWidthCompDetails((prevFullWidthCompDetails) => ({
            ...prevFullWidthCompDetails,
            params: fullWidthParams
          }));
          return true;
        } else {
          if (!fullWidthCompRef.current || !fullWidthCompRef.current.refresh) {
            return false;
          }
          return fullWidthCompRef.current.refresh(fullWidthParams);
        }
      }
    };
    rowCtrl.setComp(compProxy, eRef, containerType, compBean.current);
  }, []);
  (0, import_react19.useLayoutEffect)(
    () => showJsComp(fullWidthCompDetails, context, eGui.current, fullWidthCompRef),
    [fullWidthCompDetails]
  );
  const rowStyles = (0, import_react19.useMemo)(() => {
    const res = { top, transform };
    Object.assign(res, userStyles);
    return res;
  }, [top, transform, userStyles]);
  const showFullWidthFramework = isFullWidth && fullWidthCompDetails?.componentFromFramework;
  const showCells = !isFullWidth && cellCtrlsMerged != null;
  const reactFullWidthCellRendererStateless = (0, import_react19.useMemo)(() => {
    const res = fullWidthCompDetails?.componentFromFramework && isComponentStateless(fullWidthCompDetails.componentClass);
    return !!res;
  }, [fullWidthCompDetails]);
  const canRefreshFullWidthRef = (0, import_react19.useRef)(false);
  (0, import_react19.useEffect)(() => {
    canRefreshFullWidthRef.current = reactFullWidthCellRendererStateless && !!fullWidthCompDetails && !!gos.get("reactiveCustomComponents");
  }, [reactFullWidthCellRendererStateless, fullWidthCompDetails]);
  const showCellsJsx = () => cellCtrlsMerged?.map((cellCtrl) => import_react19.default.createElement(
    cellComp_default,
    {
      cellCtrl,
      editingCell: editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false,
      printLayout: rowCtrl.printLayout,
      key: cellCtrl.instanceId
    }
  ));
  const showFullWidthFrameworkJsx = () => {
    const FullWidthComp = fullWidthCompDetails.componentClass;
    return reactFullWidthCellRendererStateless ? import_react19.default.createElement(FullWidthComp, { ...fullWidthCompDetails.params }) : import_react19.default.createElement(FullWidthComp, { ...fullWidthCompDetails.params, ref: fullWidthCompRef });
  };
  return import_react19.default.createElement(
    "div",
    {
      ref: setRef2,
      role: "row",
      style: rowStyles,
      "row-index": rowIndex,
      "row-id": rowId,
      "row-business-key": rowBusinessKey
    },
    showCells ? showCellsJsx() : showFullWidthFramework ? showFullWidthFrameworkJsx() : null
  );
};
var rowComp_default = (0, import_react19.memo)(RowComp);
var RowContainerComp = ({ name }) => {
  const { context, gos } = (0, import_react18.useContext)(BeansContext);
  const containerOptions = (0, import_react18.useMemo)(() => _getRowContainerOptions(name), [name]);
  const eViewport = (0, import_react18.useRef)(null);
  const eContainer = (0, import_react18.useRef)(null);
  const eSpanContainer = (0, import_react18.useRef)(null);
  const rowCtrlsRef = (0, import_react18.useRef)([]);
  const prevRowCtrlsRef = (0, import_react18.useRef)([]);
  const [rowCtrlsOrdered, setRowCtrlsOrdered] = (0, import_react18.useState)(() => []);
  const isSpanning = !!gos.get("enableCellSpan") && !!containerOptions.getSpannedRowCtrls;
  const spannedRowCtrlsRef = (0, import_react18.useRef)([]);
  const prevSpannedRowCtrlsRef = (0, import_react18.useRef)([]);
  const [spannedRowCtrlsOrdered, setSpannedRowCtrlsOrdered] = (0, import_react18.useState)(() => []);
  const domOrderRef = (0, import_react18.useRef)(false);
  const rowContainerCtrlRef = (0, import_react18.useRef)();
  const viewportClasses = (0, import_react18.useMemo)(() => classesList("ag-viewport", _getRowViewportClass(name)), [name]);
  const containerClasses = (0, import_react18.useMemo)(() => classesList(_getRowContainerClass(name)), [name]);
  const spanClasses = (0, import_react18.useMemo)(() => classesList("ag-spanning-container", _getRowSpanContainerClass(name)), [name]);
  const shouldRenderViewport = containerOptions.type === "center" || isSpanning;
  const topLevelRef = shouldRenderViewport ? eViewport : eContainer;
  reactComment_default(" AG Row Container " + name + " ", topLevelRef);
  const areElementsReady = (0, import_react18.useCallback)(() => {
    const viewportReady = !shouldRenderViewport || eViewport.current != null;
    const containerReady = eContainer.current != null;
    const spanContainerReady = !isSpanning || eSpanContainer.current != null;
    return viewportReady && containerReady && spanContainerReady;
  }, []);
  const areElementsRemoved = (0, import_react18.useCallback)(() => {
    return eViewport.current == null && eContainer.current == null && eSpanContainer.current == null;
  }, []);
  const setRef2 = (0, import_react18.useCallback)(() => {
    if (areElementsRemoved()) {
      rowContainerCtrlRef.current = context.destroyBean(rowContainerCtrlRef.current);
    }
    if (context.isDestroyed()) {
      return;
    }
    if (areElementsReady()) {
      const updateRowCtrlsOrdered = (useFlushSync) => {
        const next = getNextValueIfDifferent(
          prevRowCtrlsRef.current,
          rowCtrlsRef.current,
          domOrderRef.current
        );
        if (next !== prevRowCtrlsRef.current) {
          prevRowCtrlsRef.current = next;
          agFlushSync(useFlushSync, () => setRowCtrlsOrdered(next));
        }
      };
      const updateSpannedRowCtrlsOrdered = (useFlushSync) => {
        const next = getNextValueIfDifferent(
          prevSpannedRowCtrlsRef.current,
          spannedRowCtrlsRef.current,
          domOrderRef.current
        );
        if (next !== prevSpannedRowCtrlsRef.current) {
          prevSpannedRowCtrlsRef.current = next;
          agFlushSync(useFlushSync, () => setSpannedRowCtrlsOrdered(next));
        }
      };
      const compProxy = {
        setHorizontalScroll: (offset) => {
          if (eViewport.current) {
            eViewport.current.scrollLeft = offset;
          }
        },
        setViewportHeight: (height) => {
          if (eViewport.current) {
            eViewport.current.style.height = height;
          }
        },
        setRowCtrls: ({ rowCtrls, useFlushSync }) => {
          const useFlush = !!useFlushSync && rowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
          rowCtrlsRef.current = rowCtrls;
          updateRowCtrlsOrdered(useFlush);
        },
        setSpannedRowCtrls: (rowCtrls, useFlushSync) => {
          const useFlush = !!useFlushSync && spannedRowCtrlsRef.current.length > 0 && rowCtrls.length > 0;
          spannedRowCtrlsRef.current = rowCtrls;
          updateSpannedRowCtrlsOrdered(useFlush);
        },
        setDomOrder: (domOrder) => {
          if (domOrderRef.current != domOrder) {
            domOrderRef.current = domOrder;
            updateRowCtrlsOrdered(false);
          }
        },
        setContainerWidth: (width) => {
          if (eContainer.current) {
            eContainer.current.style.width = width;
          }
        },
        setOffsetTop: (offset) => {
          if (eContainer.current) {
            eContainer.current.style.transform = `translateY(${offset})`;
          }
        }
      };
      rowContainerCtrlRef.current = context.createBean(new RowContainerCtrl(name));
      rowContainerCtrlRef.current.setComp(
        compProxy,
        eContainer.current,
        eSpanContainer.current ?? void 0,
        eViewport.current
      );
    }
  }, [areElementsReady, areElementsRemoved]);
  const setContainerRef = (0, import_react18.useCallback)(
    (e) => {
      eContainer.current = e;
      setRef2();
    },
    [setRef2]
  );
  const setSpanContainerRef = (0, import_react18.useCallback)(
    (e) => {
      eSpanContainer.current = e;
      setRef2();
    },
    [setRef2]
  );
  const setViewportRef = (0, import_react18.useCallback)(
    (e) => {
      eViewport.current = e;
      setRef2();
    },
    [setRef2]
  );
  const buildContainer = () => import_react18.default.createElement(
    "div",
    {
      className: containerClasses,
      ref: setContainerRef,
      role: shouldRenderViewport ? "presentation" : "rowgroup"
    },
    rowCtrlsOrdered.map((rowCtrl) => import_react18.default.createElement(rowComp_default, { rowCtrl, containerType: containerOptions.type, key: rowCtrl.instanceId }))
  );
  if (!shouldRenderViewport) {
    return buildContainer();
  }
  const buildSpanContainer = () => import_react18.default.createElement("div", { className: spanClasses, ref: setSpanContainerRef, role: "presentation" }, spannedRowCtrlsOrdered.map((rowCtrl) => import_react18.default.createElement(rowComp_default, { rowCtrl, containerType: containerOptions.type, key: rowCtrl.instanceId })));
  return import_react18.default.createElement("div", { className: viewportClasses, ref: setViewportRef, role: "rowgroup" }, buildContainer(), isSpanning ? buildSpanContainer() : null);
};
var rowContainerComp_default = (0, import_react18.memo)(RowContainerComp);
var GridBodyComp = () => {
  const beans = (0, import_react10.useContext)(BeansContext);
  const { context, overlays } = beans;
  const [rowAnimationClass, setRowAnimationClass] = (0, import_react10.useState)("");
  const [topHeight, setTopHeight] = (0, import_react10.useState)(0);
  const [bottomHeight, setBottomHeight] = (0, import_react10.useState)(0);
  const [stickyTopHeight, setStickyTopHeight] = (0, import_react10.useState)("0px");
  const [stickyTopTop, setStickyTopTop] = (0, import_react10.useState)("0px");
  const [stickyTopWidth, setStickyTopWidth] = (0, import_react10.useState)("100%");
  const [stickyBottomHeight, setStickyBottomHeight] = (0, import_react10.useState)("0px");
  const [stickyBottomBottom, setStickyBottomBottom] = (0, import_react10.useState)("0px");
  const [stickyBottomWidth, setStickyBottomWidth] = (0, import_react10.useState)("100%");
  const [topInvisible, setTopInvisible] = (0, import_react10.useState)(true);
  const [bottomInvisible, setBottomInvisible] = (0, import_react10.useState)(true);
  const [forceVerticalScrollClass, setForceVerticalScrollClass] = (0, import_react10.useState)(null);
  const [topAndBottomOverflowY, setTopAndBottomOverflowY] = (0, import_react10.useState)("");
  const [cellSelectableCss, setCellSelectableCss] = (0, import_react10.useState)(null);
  const [layoutClass, setLayoutClass] = (0, import_react10.useState)("ag-layout-normal");
  const cssManager = (0, import_react10.useRef)();
  if (!cssManager.current) {
    cssManager.current = new CssClassManager(() => eRoot.current);
  }
  const eRoot = (0, import_react10.useRef)(null);
  const eTop = (0, import_react10.useRef)(null);
  const eStickyTop = (0, import_react10.useRef)(null);
  const eStickyBottom = (0, import_react10.useRef)(null);
  const eBody = (0, import_react10.useRef)(null);
  const eBodyViewport = (0, import_react10.useRef)(null);
  const eBottom = (0, import_react10.useRef)(null);
  const beansToDestroy = (0, import_react10.useRef)([]);
  const destroyFuncs = (0, import_react10.useRef)([]);
  reactComment_default(" AG Grid Body ", eRoot);
  reactComment_default(" AG Pinned Top ", eTop);
  reactComment_default(" AG Sticky Top ", eStickyTop);
  reactComment_default(" AG Middle ", eBodyViewport);
  reactComment_default(" AG Pinned Bottom ", eBottom);
  const setRef2 = (0, import_react10.useCallback)((eRef) => {
    eRoot.current = eRef;
    if (!eRef || context.isDestroyed()) {
      beansToDestroy.current = context.destroyBeans(beansToDestroy.current);
      for (const f of destroyFuncs.current) {
        f();
      }
      destroyFuncs.current = [];
      return;
    }
    const attachToDom = (eParent, eChild) => {
      eParent.appendChild(eChild);
      destroyFuncs.current.push(() => eChild.remove());
    };
    const newComp = (compClass) => {
      const comp = context.createBean(new compClass());
      beansToDestroy.current.push(comp);
      return comp;
    };
    const addComp = (eParent, compClass, comment) => {
      attachToDom(eParent, document.createComment(comment));
      attachToDom(eParent, newComp(compClass).getGui());
    };
    addComp(eRef, FakeHScrollComp, " AG Fake Horizontal Scroll ");
    const overlayComp = overlays?.getOverlayWrapperCompClass();
    if (overlayComp) {
      addComp(eRef, overlayComp, " AG Overlay Wrapper ");
    }
    if (eBody.current) {
      addComp(eBody.current, FakeVScrollComp, " AG Fake Vertical Scroll ");
    }
    const compProxy = {
      setRowAnimationCssOnBodyViewport: setRowAnimationClass,
      setColumnCount: (count) => {
        if (eRoot.current) {
          _setAriaColCount(eRoot.current, count);
        }
      },
      setRowCount: (count) => {
        if (eRoot.current) {
          _setAriaRowCount(eRoot.current, count);
        }
      },
      setTopHeight,
      setBottomHeight,
      setStickyTopHeight,
      setStickyTopTop,
      setStickyTopWidth,
      setTopInvisible,
      setBottomInvisible,
      setColumnMovingCss: (cssClass, flag) => cssManager.current.toggleCss(cssClass, flag),
      updateLayoutClasses: setLayoutClass,
      setAlwaysVerticalScrollClass: setForceVerticalScrollClass,
      setPinnedTopBottomOverflowY: setTopAndBottomOverflowY,
      setCellSelectableCss: (cssClass, flag) => setCellSelectableCss(flag ? cssClass : null),
      setBodyViewportWidth: (width) => {
        if (eBodyViewport.current) {
          eBodyViewport.current.style.width = width;
        }
      },
      registerBodyViewportResizeListener: (listener) => {
        if (eBodyViewport.current) {
          const unsubscribeFromResize = _observeResize(beans, eBodyViewport.current, listener);
          destroyFuncs.current.push(() => unsubscribeFromResize());
        }
      },
      setStickyBottomHeight,
      setStickyBottomBottom,
      setStickyBottomWidth,
      setGridRootRole: (role) => eRef.setAttribute("role", role)
    };
    const ctrl = context.createBean(new GridBodyCtrl());
    beansToDestroy.current.push(ctrl);
    ctrl.setComp(
      compProxy,
      eRef,
      eBodyViewport.current,
      eTop.current,
      eBottom.current,
      eStickyTop.current,
      eStickyBottom.current
    );
  }, []);
  const rootClasses = (0, import_react10.useMemo)(() => classesList("ag-root", "ag-unselectable", layoutClass), [layoutClass]);
  const bodyViewportClasses = (0, import_react10.useMemo)(
    () => classesList(
      "ag-body-viewport",
      rowAnimationClass,
      layoutClass,
      forceVerticalScrollClass,
      cellSelectableCss
    ),
    [rowAnimationClass, layoutClass, forceVerticalScrollClass, cellSelectableCss]
  );
  const bodyClasses = (0, import_react10.useMemo)(() => classesList("ag-body", layoutClass), [layoutClass]);
  const topClasses = (0, import_react10.useMemo)(
    () => classesList("ag-floating-top", topInvisible ? "ag-invisible" : null, cellSelectableCss),
    [cellSelectableCss, topInvisible]
  );
  const stickyTopClasses = (0, import_react10.useMemo)(() => classesList("ag-sticky-top", cellSelectableCss), [cellSelectableCss]);
  const stickyBottomClasses = (0, import_react10.useMemo)(
    () => classesList("ag-sticky-bottom", stickyBottomHeight === "0px" ? "ag-invisible" : null, cellSelectableCss),
    [cellSelectableCss, stickyBottomHeight]
  );
  const bottomClasses = (0, import_react10.useMemo)(
    () => classesList("ag-floating-bottom", bottomInvisible ? "ag-invisible" : null, cellSelectableCss),
    [cellSelectableCss, bottomInvisible]
  );
  const topStyle = (0, import_react10.useMemo)(
    () => ({
      height: topHeight,
      minHeight: topHeight,
      overflowY: topAndBottomOverflowY
    }),
    [topHeight, topAndBottomOverflowY]
  );
  const stickyTopStyle = (0, import_react10.useMemo)(
    () => ({
      height: stickyTopHeight,
      top: stickyTopTop,
      width: stickyTopWidth
    }),
    [stickyTopHeight, stickyTopTop, stickyTopWidth]
  );
  const stickyBottomStyle = (0, import_react10.useMemo)(
    () => ({
      height: stickyBottomHeight,
      bottom: stickyBottomBottom,
      width: stickyBottomWidth
    }),
    [stickyBottomHeight, stickyBottomBottom, stickyBottomWidth]
  );
  const bottomStyle = (0, import_react10.useMemo)(
    () => ({
      height: bottomHeight,
      minHeight: bottomHeight,
      overflowY: topAndBottomOverflowY
    }),
    [bottomHeight, topAndBottomOverflowY]
  );
  const createRowContainer = (container) => import_react10.default.createElement(rowContainerComp_default, { name: container, key: `${container}-container` });
  const createSection = ({
    section,
    children,
    className,
    style
  }) => import_react10.default.createElement("div", { ref: section, className, role: "presentation", style }, children.map(createRowContainer));
  return import_react10.default.createElement("div", { ref: setRef2, className: rootClasses }, import_react10.default.createElement(gridHeaderComp_default, null), createSection({
    section: eTop,
    className: topClasses,
    style: topStyle,
    children: ["topLeft", "topCenter", "topRight", "topFullWidth"]
  }), import_react10.default.createElement("div", { className: bodyClasses, ref: eBody, role: "presentation" }, createSection({
    section: eBodyViewport,
    className: bodyViewportClasses,
    children: ["left", "center", "right", "fullWidth"]
  })), createSection({
    section: eStickyTop,
    className: stickyTopClasses,
    style: stickyTopStyle,
    children: ["stickyTopLeft", "stickyTopCenter", "stickyTopRight", "stickyTopFullWidth"]
  }), createSection({
    section: eStickyBottom,
    className: stickyBottomClasses,
    style: stickyBottomStyle,
    children: ["stickyBottomLeft", "stickyBottomCenter", "stickyBottomRight", "stickyBottomFullWidth"]
  }), createSection({
    section: eBottom,
    className: bottomClasses,
    style: bottomStyle,
    children: ["bottomLeft", "bottomCenter", "bottomRight", "bottomFullWidth"]
  }));
};
var gridBodyComp_default = (0, import_react10.memo)(GridBodyComp);
var TabGuardCompRef = (props, forwardRef4) => {
  const { children, eFocusableElement, onTabKeyDown, gridCtrl, forceFocusOutWhenTabGuardsAreEmpty, isEmpty } = props;
  const { context } = (0, import_react26.useContext)(BeansContext);
  const topTabGuardRef = (0, import_react26.useRef)(null);
  const bottomTabGuardRef = (0, import_react26.useRef)(null);
  const tabGuardCtrlRef = (0, import_react26.useRef)();
  const setTabIndex = (value) => {
    const processedValue = value == null ? void 0 : parseInt(value, 10).toString();
    for (const tabGuard of [topTabGuardRef, bottomTabGuardRef]) {
      if (processedValue === void 0) {
        tabGuard.current?.removeAttribute("tabindex");
      } else {
        tabGuard.current?.setAttribute("tabindex", processedValue);
      }
    }
  };
  (0, import_react26.useImperativeHandle)(forwardRef4, () => ({
    forceFocusOutOfContainer(up) {
      tabGuardCtrlRef.current?.forceFocusOutOfContainer(up);
    }
  }));
  const setupCtrl = (0, import_react26.useCallback)(() => {
    const topTabGuard = topTabGuardRef.current;
    const bottomTabGuard = bottomTabGuardRef.current;
    if (!topTabGuard && !bottomTabGuard || context.isDestroyed()) {
      tabGuardCtrlRef.current = context.destroyBean(tabGuardCtrlRef.current);
      return;
    }
    if (topTabGuard && bottomTabGuard) {
      const compProxy = {
        setTabIndex
      };
      tabGuardCtrlRef.current = context.createBean(
        new TabGuardCtrl({
          comp: compProxy,
          eTopGuard: topTabGuard,
          eBottomGuard: bottomTabGuard,
          eFocusableElement,
          onTabKeyDown,
          forceFocusOutWhenTabGuardsAreEmpty,
          focusInnerElement: (fromBottom) => gridCtrl.focusInnerElement(fromBottom),
          isEmpty
        })
      );
    }
  }, []);
  const setTopRef = (0, import_react26.useCallback)(
    (e) => {
      topTabGuardRef.current = e;
      setupCtrl();
    },
    [setupCtrl]
  );
  const setBottomRef = (0, import_react26.useCallback)(
    (e) => {
      bottomTabGuardRef.current = e;
      setupCtrl();
    },
    [setupCtrl]
  );
  const createTabGuard = (side) => {
    const className = side === "top" ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
    return import_react26.default.createElement(
      "div",
      {
        className: `${TabGuardClassNames.TAB_GUARD} ${className}`,
        role: "presentation",
        ref: side === "top" ? setTopRef : setBottomRef
      }
    );
  };
  return import_react26.default.createElement(import_react26.default.Fragment, null, createTabGuard("top"), children, createTabGuard("bottom"));
};
var TabGuardComp = (0, import_react26.forwardRef)(TabGuardCompRef);
var tabGuardComp_default = (0, import_react26.memo)(TabGuardComp);
var GridComp = ({ context }) => {
  const [rtlClass, setRtlClass] = (0, import_react9.useState)("");
  const [layoutClass, setLayoutClass] = (0, import_react9.useState)("");
  const [cursor, setCursor] = (0, import_react9.useState)(null);
  const [userSelect, setUserSelect] = (0, import_react9.useState)(null);
  const [initialised, setInitialised] = (0, import_react9.useState)(false);
  const [tabGuardReady, setTabGuardReady] = (0, import_react9.useState)();
  const gridCtrlRef = (0, import_react9.useRef)();
  const eRootWrapperRef = (0, import_react9.useRef)(null);
  const tabGuardRef = (0, import_react9.useRef)();
  const [eGridBodyParent, setGridBodyParent] = (0, import_react9.useState)(null);
  const focusInnerElementRef = (0, import_react9.useRef)(() => void 0);
  const paginationCompRef = (0, import_react9.useRef)();
  const focusableContainersRef = (0, import_react9.useRef)([]);
  const onTabKeyDown = (0, import_react9.useCallback)(() => void 0, []);
  reactComment_default(" AG Grid ", eRootWrapperRef);
  const setRef2 = (0, import_react9.useCallback)((eRef) => {
    eRootWrapperRef.current = eRef;
    gridCtrlRef.current = eRef ? context.createBean(new GridCtrl()) : context.destroyBean(gridCtrlRef.current);
    if (!eRef || context.isDestroyed()) {
      return;
    }
    const gridCtrl = gridCtrlRef.current;
    focusInnerElementRef.current = gridCtrl.focusInnerElement.bind(gridCtrl);
    const compProxy = {
      destroyGridUi: () => {
      },
      // do nothing, as framework users destroy grid by removing the comp
      setRtlClass,
      forceFocusOutOfContainer: (up) => {
        if (!up && paginationCompRef.current?.isDisplayed()) {
          paginationCompRef.current.forceFocusOutOfContainer(up);
          return;
        }
        tabGuardRef.current?.forceFocusOutOfContainer(up);
      },
      updateLayoutClasses: setLayoutClass,
      getFocusableContainers: () => {
        const comps = [];
        const gridBodyCompEl = eRootWrapperRef.current?.querySelector(".ag-root");
        if (gridBodyCompEl) {
          comps.push({ getGui: () => gridBodyCompEl });
        }
        for (const comp of focusableContainersRef.current) {
          if (comp.isDisplayed()) {
            comps.push(comp);
          }
        }
        return comps;
      },
      setCursor,
      setUserSelect
    };
    gridCtrl.setComp(compProxy, eRef, eRef);
    setInitialised(true);
  }, []);
  (0, import_react9.useEffect)(() => {
    const gridCtrl = gridCtrlRef.current;
    const eRootWrapper = eRootWrapperRef.current;
    if (!tabGuardReady || !gridCtrl || !eGridBodyParent || !eRootWrapper || context.isDestroyed()) {
      return;
    }
    const beansToDestroy = [];
    const {
      watermarkSelector,
      paginationSelector,
      sideBarSelector,
      statusBarSelector,
      gridHeaderDropZonesSelector
    } = gridCtrl.getOptionalSelectors();
    const additionalEls = [];
    if (gridHeaderDropZonesSelector) {
      const headerDropZonesComp = context.createBean(new gridHeaderDropZonesSelector.component());
      const eGui = headerDropZonesComp.getGui();
      eRootWrapper.insertAdjacentElement("afterbegin", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(headerDropZonesComp);
    }
    if (sideBarSelector) {
      const sideBarComp = context.createBean(new sideBarSelector.component());
      const eGui = sideBarComp.getGui();
      const bottomTabGuard = eGridBodyParent.querySelector(".ag-tab-guard-bottom");
      if (bottomTabGuard) {
        bottomTabGuard.insertAdjacentElement("beforebegin", eGui);
        additionalEls.push(eGui);
      }
      beansToDestroy.push(sideBarComp);
      focusableContainersRef.current.push(sideBarComp);
    }
    const addComponentToDom = (component) => {
      const comp = context.createBean(new component());
      const eGui = comp.getGui();
      eRootWrapper.insertAdjacentElement("beforeend", eGui);
      additionalEls.push(eGui);
      beansToDestroy.push(comp);
      return comp;
    };
    if (statusBarSelector) {
      addComponentToDom(statusBarSelector.component);
    }
    if (paginationSelector) {
      const paginationComp = addComponentToDom(paginationSelector.component);
      paginationCompRef.current = paginationComp;
      focusableContainersRef.current.push(paginationComp);
    }
    if (watermarkSelector) {
      addComponentToDom(watermarkSelector.component);
    }
    return () => {
      context.destroyBeans(beansToDestroy);
      for (const el of additionalEls) {
        el.remove();
      }
    };
  }, [tabGuardReady, eGridBodyParent, context]);
  const rootWrapperClasses = (0, import_react9.useMemo)(
    () => classesList("ag-root-wrapper", rtlClass, layoutClass),
    [rtlClass, layoutClass]
  );
  const rootWrapperBodyClasses = (0, import_react9.useMemo)(
    () => classesList("ag-root-wrapper-body", "ag-focus-managed", layoutClass),
    [layoutClass]
  );
  const topStyle = (0, import_react9.useMemo)(
    () => ({
      userSelect: userSelect != null ? userSelect : "",
      WebkitUserSelect: userSelect != null ? userSelect : "",
      cursor: cursor != null ? cursor : ""
    }),
    [userSelect, cursor]
  );
  const setTabGuardCompRef = (0, import_react9.useCallback)((ref) => {
    tabGuardRef.current = ref;
    setTabGuardReady(ref !== null);
  }, []);
  const isFocusable = (0, import_react9.useCallback)(() => !gridCtrlRef.current?.isFocusable(), []);
  return import_react9.default.createElement("div", { ref: setRef2, className: rootWrapperClasses, style: topStyle, role: "presentation" }, import_react9.default.createElement("div", { className: rootWrapperBodyClasses, ref: setGridBodyParent, role: "presentation" }, initialised && eGridBodyParent && !context.isDestroyed() && import_react9.default.createElement(BeansContext.Provider, { value: context.getBeans() }, import_react9.default.createElement(
    tabGuardComp_default,
    {
      ref: setTabGuardCompRef,
      eFocusableElement: eGridBodyParent,
      onTabKeyDown,
      gridCtrl: gridCtrlRef.current,
      forceFocusOutWhenTabGuardsAreEmpty: true,
      isEmpty: isFocusable
    },
    // we wait for initialised before rending the children, so GridComp has created and registered with it's
    // GridCtrl before we create the child GridBodyComp. Otherwise the GridBodyComp would initialise first,
    // before we have set the the Layout CSS classes, causing the GridBodyComp to render rows to a grid that
    // doesn't have it's height specified, which would result if all the rows getting rendered (and if many rows,
    // hangs the UI)
    import_react9.default.createElement(gridBodyComp_default, null)
  ))));
};
var gridComp_default = (0, import_react9.memo)(GridComp);
var RenderStatusService = class extends BeanStub {
  postConstruct() {
    if (this.beans.colAutosize) {
      const queueResizeOperationsForTick = this.queueResizeOperationsForTick.bind(this);
      this.addManagedEventListeners({
        rowExpansionStateChanged: queueResizeOperationsForTick,
        expandOrCollapseAll: queueResizeOperationsForTick,
        // Enable devs to resize after they updated via the API
        cellValueChanged: queueResizeOperationsForTick,
        rowNodeDataChanged: queueResizeOperationsForTick,
        rowDataUpdated: queueResizeOperationsForTick
      });
    }
  }
  queueResizeOperationsForTick() {
    const colAutosize = this.beans.colAutosize;
    colAutosize.shouldQueueResizeOperations = true;
    setTimeout(() => {
      colAutosize.processResizeOperations();
    }, 0);
  }
  areHeaderCellsRendered() {
    return this.beans.ctrlsSvc.getHeaderRowContainerCtrls().every((container) => container.getAllCtrls().every((ctrl) => ctrl.areCellsRendered()));
  }
  areCellsRendered() {
    return this.beans.rowRenderer.getAllRowCtrls().every((row) => row.isRowRendered() && row.getAllCellCtrls().every((cellCtrl) => !!cellCtrl.eGui));
  }
};
var deprecatedProps = {
  setGridApi: void 0,
  maxComponentCreationTimeMs: void 0,
  children: void 0
};
var reactPropsNotGridOptions = {
  gridOptions: void 0,
  modules: void 0,
  containerStyle: void 0,
  className: void 0,
  passGridApi: void 0,
  componentWrappingElement: void 0,
  ...deprecatedProps
};
var excludeReactCompProps = new Set(Object.keys(reactPropsNotGridOptions));
var deprecatedReactCompProps = new Set(Object.keys(deprecatedProps));
var AgGridReactUi = (props) => {
  const apiRef = (0, import_react2.useRef)();
  const eGui = (0, import_react2.useRef)(null);
  const portalManager = (0, import_react2.useRef)(null);
  const destroyFuncs = (0, import_react2.useRef)([]);
  const whenReadyFuncs = (0, import_react2.useRef)([]);
  const prevProps = (0, import_react2.useRef)(props);
  const frameworkOverridesRef = (0, import_react2.useRef)();
  const gridIdRef = (0, import_react2.useRef)();
  const ready = (0, import_react2.useRef)(false);
  const [context, setContext] = (0, import_react2.useState)(void 0);
  const [, setPortalRefresher] = (0, import_react2.useState)(0);
  const appliedClassName = (0, import_react2.useRef)();
  const updateClassName = (classNameFromReact) => {
    const classList = eGui.current?.classList;
    const splitClasses = (s = "") => s.trim().split(/\s+/g).filter(Boolean);
    if (appliedClassName.current !== classNameFromReact) {
      for (const cls of splitClasses(appliedClassName.current)) {
        if (classList?.contains(cls)) {
          classList.remove(cls);
        }
      }
      for (const cls of splitClasses(classNameFromReact)) {
        if (!classList?.contains(cls)) {
          classList?.add(cls);
        }
      }
      appliedClassName.current = classNameFromReact;
    }
  };
  (0, import_react2.useLayoutEffect)(() => {
    updateClassName(props.className);
  }, [props.className]);
  const setRef2 = (0, import_react2.useCallback)((eRef) => {
    eGui.current = eRef;
    updateClassName(props.className);
    if (!eRef) {
      for (const f of destroyFuncs.current) {
        f();
      }
      destroyFuncs.current.length = 0;
      return;
    }
    const modules = props.modules || [];
    if (!portalManager.current) {
      portalManager.current = new PortalManager(
        () => setPortalRefresher((prev) => prev + 1),
        props.componentWrappingElement,
        props.maxComponentCreationTimeMs
      );
      destroyFuncs.current.push(() => {
        portalManager.current?.destroy();
        portalManager.current = null;
      });
    }
    const mergedGridOps = _combineAttributesAndGridOptions(
      props.gridOptions,
      props,
      Object.keys(props).filter((key) => !excludeReactCompProps.has(key))
    );
    const processQueuedUpdates = () => {
      if (ready.current) {
        const getFn = () => frameworkOverridesRef.current?.shouldQueueUpdates() ? void 0 : whenReadyFuncs.current.shift();
        let fn = getFn();
        while (fn) {
          fn();
          fn = getFn();
        }
      }
    };
    const frameworkOverrides = new ReactFrameworkOverrides(processQueuedUpdates);
    frameworkOverridesRef.current = frameworkOverrides;
    const renderStatus = new RenderStatusService();
    const gridParams = {
      providedBeanInstances: {
        frameworkCompWrapper: new ReactFrameworkComponentWrapper(portalManager.current, mergedGridOps),
        renderStatus
      },
      modules,
      frameworkOverrides,
      setThemeOnGridDiv: true
    };
    const createUiCallback = (ctx) => {
      setContext(ctx);
      ctx.createBean(renderStatus);
      destroyFuncs.current.push(() => {
        ctx.destroy();
      });
      ctx.getBean("ctrlsSvc").whenReady(
        {
          addDestroyFunc: (func) => {
            destroyFuncs.current.push(func);
          }
        },
        () => {
          if (ctx.isDestroyed()) {
            return;
          }
          const api = apiRef.current;
          if (api) {
            props.passGridApi?.(api);
          }
        }
      );
    };
    const acceptChangesCallback = (context2) => {
      context2.getBean("ctrlsSvc").whenReady(
        {
          addDestroyFunc: (func) => {
            destroyFuncs.current.push(func);
          }
        },
        () => {
          for (const f of whenReadyFuncs.current) {
            f();
          }
          whenReadyFuncs.current.length = 0;
          ready.current = true;
        }
      );
    };
    const gridCoreCreator = new GridCoreCreator();
    mergedGridOps.gridId ?? (mergedGridOps.gridId = gridIdRef.current);
    apiRef.current = gridCoreCreator.create(
      eRef,
      mergedGridOps,
      createUiCallback,
      acceptChangesCallback,
      gridParams
    );
    destroyFuncs.current.push(() => {
      apiRef.current = void 0;
    });
    if (apiRef.current) {
      gridIdRef.current = apiRef.current.getGridId();
    }
  }, []);
  const style = (0, import_react2.useMemo)(() => {
    return {
      height: "100%",
      ...props.containerStyle || {}
    };
  }, [props.containerStyle]);
  const processWhenReady = (0, import_react2.useCallback)((func) => {
    if (ready.current && !frameworkOverridesRef.current?.shouldQueueUpdates()) {
      func();
    } else {
      whenReadyFuncs.current.push(func);
    }
  }, []);
  (0, import_react2.useEffect)(() => {
    const changes = extractGridPropertyChanges(prevProps.current, props);
    prevProps.current = props;
    processWhenReady(() => {
      if (apiRef.current) {
        _processOnChange(changes, apiRef.current);
      }
    });
  }, [props]);
  const renderMode = !import_react2.default.useSyncExternalStore || _getGridOption(props, "renderingMode") === "legacy" ? "legacy" : "default";
  return (
    // IMPORTANT! Don't set className here, we must use classList
    // imperatively to avoid removing classes set by the grid
    import_react2.default.createElement("div", { style, ref: setRef2 }, import_react2.default.createElement(RenderModeContext.Provider, { value: renderMode }, context && !context.isDestroyed() ? import_react2.default.createElement(gridComp_default, { key: context.instanceId, context }) : null, portalManager.current?.getPortals() ?? null))
  );
};
function extractGridPropertyChanges(prevProps, nextProps) {
  const changes = {};
  for (const propKey of Object.keys(nextProps)) {
    if (excludeReactCompProps.has(propKey)) {
      if (deprecatedReactCompProps.has(propKey)) {
        _warn(274, { prop: propKey });
      }
      continue;
    }
    const propValue = nextProps[propKey];
    if (prevProps[propKey] !== propValue) {
      changes[propKey] = propValue;
    }
  }
  return changes;
}
var ReactFrameworkComponentWrapper = class extends BaseComponentWrapper {
  constructor(parent, gridOptions) {
    super();
    this.parent = parent;
    this.gridOptions = gridOptions;
  }
  createWrapper(UserReactComponent, componentType) {
    const gridOptions = this.gridOptions;
    const reactiveCustomComponents = _getGridOption(gridOptions, "reactiveCustomComponents");
    if (reactiveCustomComponents) {
      const getComponentClass = (propertyName) => {
        switch (propertyName) {
          case "filter":
            return _getGridOption(gridOptions, "enableFilterHandlers") ? FilterDisplayComponentWrapper : FilterComponentWrapper;
          case "floatingFilterComponent":
            return _getGridOption(gridOptions, "enableFilterHandlers") ? FloatingFilterDisplayComponentWrapper : FloatingFilterComponentWrapper;
          case "dateComponent":
            return DateComponentWrapper;
          case "dragAndDropImageComponent":
            return DragAndDropImageComponentWrapper;
          case "loadingOverlayComponent":
          case "noRowsOverlayComponent":
          case "activeOverlay":
            return CustomOverlayComponentWrapper;
          case "statusPanel":
            return StatusPanelComponentWrapper;
          case "toolPanel":
            return ToolPanelComponentWrapper;
          case "menuItem":
            return MenuItemComponentWrapper;
          case "cellRenderer":
            return CellRendererComponentWrapper;
          case "innerHeaderComponent":
            return InnerHeaderComponentWrapper;
        }
      };
      const ComponentClass = getComponentClass(componentType.name);
      if (ComponentClass) {
        return new ComponentClass(UserReactComponent, this.parent, componentType);
      }
    } else {
      switch (componentType.name) {
        case "filter":
        case "floatingFilterComponent":
        case "dateComponent":
        case "dragAndDropImageComponent":
        case "loadingOverlayComponent":
        case "noRowsOverlayComponent":
        case "activeOverlay":
        case "statusPanel":
        case "toolPanel":
        case "menuItem":
        case "cellRenderer":
          warnReactiveCustomComponents();
          break;
      }
    }
    const suppressFallbackMethods = !componentType.cellRenderer && componentType.name !== "toolPanel";
    return new ReactComponent(UserReactComponent, this.parent, componentType, suppressFallbackMethods);
  }
};
var DetailCellRenderer = (0, import_react2.forwardRef)((props, ref) => {
  const beans = (0, import_react2.useContext)(BeansContext);
  const { registry, context, gos, rowModel } = beans;
  const [cssClasses, setCssClasses] = (0, import_react2.useState)(() => new CssClasses());
  const [gridCssClasses, setGridCssClasses] = (0, import_react2.useState)(() => new CssClasses());
  const [detailGridOptions, setDetailGridOptions] = (0, import_react2.useState)();
  const [detailRowData, setDetailRowData] = (0, import_react2.useState)();
  const ctrlRef = (0, import_react2.useRef)();
  const eGuiRef = (0, import_react2.useRef)(null);
  const resizeObserverDestroyFunc = (0, import_react2.useRef)();
  const parentModules = (0, import_react2.useMemo)(
    () => _getGridRegisteredModules(props.api.getGridId(), detailGridOptions?.rowModelType ?? "clientSide"),
    [props]
  );
  const topClassName = (0, import_react2.useMemo)(() => cssClasses.toString() + " ag-details-row", [cssClasses]);
  const gridClassName = (0, import_react2.useMemo)(() => gridCssClasses.toString() + " ag-details-grid", [gridCssClasses]);
  if (ref) {
    (0, import_react2.useImperativeHandle)(ref, () => ({
      refresh() {
        return ctrlRef.current?.refresh() ?? false;
      }
    }));
  }
  if (props.template) {
    _warn(230);
  }
  const setRef2 = (0, import_react2.useCallback)((eRef) => {
    eGuiRef.current = eRef;
    if (!eRef || context.isDestroyed()) {
      ctrlRef.current = context.destroyBean(ctrlRef.current);
      resizeObserverDestroyFunc.current?.();
      return;
    }
    const compProxy = {
      toggleCss: (name, on) => setCssClasses((prev) => prev.setClass(name, on)),
      toggleDetailGridCss: (name, on) => setGridCssClasses((prev) => prev.setClass(name, on)),
      setDetailGrid: (gridOptions) => setDetailGridOptions(gridOptions),
      setRowData: (rowData) => setDetailRowData(rowData),
      getGui: () => eGuiRef.current
    };
    const ctrl = registry.createDynamicBean("detailCellRendererCtrl", true);
    if (!ctrl) {
      return;
    }
    context.createBean(ctrl);
    ctrl.init(compProxy, props);
    ctrlRef.current = ctrl;
    if (gos.get("detailRowAutoHeight")) {
      const checkRowSizeFunc = () => {
        if (eGuiRef.current == null) {
          return;
        }
        const clientHeight = eGuiRef.current.clientHeight;
        if (clientHeight != null && clientHeight > 0) {
          const updateRowHeightFunc = () => {
            props.node.setRowHeight(clientHeight);
            if (_isClientSideRowModel(gos, rowModel) || _isServerSideRowModel(gos, rowModel)) {
              rowModel.onRowHeightChanged();
            }
          };
          setTimeout(updateRowHeightFunc, 0);
        }
      };
      resizeObserverDestroyFunc.current = _observeResize(beans, eRef, checkRowSizeFunc);
      checkRowSizeFunc();
    }
  }, []);
  const registerGridApi = (0, import_react2.useCallback)((api) => {
    ctrlRef.current?.registerDetailWithMaster(api);
  }, []);
  return import_react2.default.createElement("div", { className: topClassName, ref: setRef2 }, detailGridOptions && import_react2.default.createElement(
    AgGridReactUi,
    {
      className: gridClassName,
      ...detailGridOptions,
      modules: parentModules,
      rowData: detailRowData,
      passGridApi: registerGridApi
    }
  ));
});
var ReactFrameworkOverrides = class extends VanillaFrameworkOverrides {
  constructor(processQueuedUpdates) {
    super("react");
    this.processQueuedUpdates = processQueuedUpdates;
    this.queueUpdates = false;
    this.renderingEngine = "react";
    this.frameworkComponents = {
      agGroupCellRenderer: groupCellRenderer_default,
      agGroupRowRenderer: groupCellRenderer_default,
      agDetailCellRenderer: DetailCellRenderer
    };
    this.wrapIncoming = (callback, source) => {
      if (source === "ensureVisible") {
        return runWithoutFlushSync(callback);
      }
      return callback();
    };
  }
  frameworkComponent(name) {
    return this.frameworkComponents[name];
  }
  isFrameworkComponent(comp) {
    if (!comp) {
      return false;
    }
    const prototype = comp.prototype;
    const isJsComp = prototype && "getGui" in prototype;
    return !isJsComp;
  }
  getLockOnRefresh() {
    this.queueUpdates = true;
  }
  releaseLockOnRefresh() {
    this.queueUpdates = false;
    this.processQueuedUpdates();
  }
  shouldQueueUpdates() {
    return this.queueUpdates;
  }
  runWhenReadyAsync() {
    return isReact19();
  }
};
var AgGridReact = class extends import_react.Component {
  constructor() {
    super(...arguments);
    this.apiListeners = [];
    this.setGridApi = (api) => {
      this.api = api;
      for (const listener of this.apiListeners) {
        listener(api);
      }
    };
  }
  registerApiListener(listener) {
    this.apiListeners.push(listener);
  }
  componentWillUnmount() {
    this.apiListeners.length = 0;
  }
  render() {
    return import_react.default.createElement(AgGridReactUi, { ...this.props, passGridApi: this.setGridApi });
  }
};
function useGridCustomComponent(methods) {
  const { setMethods } = (0, import_react27.useContext)(CustomContext);
  setMethods(methods);
}
function useGridCellEditor(callbacks) {
  useGridCustomComponent(callbacks);
}
function useGridDate(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFilter(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFilterDisplay(callbacks) {
  return useGridCustomComponent(callbacks);
}
function useGridFloatingFilter(callbacks) {
  useGridCustomComponent(callbacks);
}
function useGridMenuItem(callbacks) {
  useGridCustomComponent(callbacks);
}
export {
  AgGridReact,
  CustomContext as CustomComponentContext,
  getInstance,
  useGridCellEditor,
  useGridDate,
  useGridFilter,
  useGridFilterDisplay,
  useGridFloatingFilter,
  useGridMenuItem,
  warnReactiveCustomComponents
};
//# sourceMappingURL=ag-grid-react.js.map
