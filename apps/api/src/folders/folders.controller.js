"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoldersController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var FoldersController = function () {
    var _classDecorators = [(0, common_1.Controller)('folders'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _create_decorators;
    var _findAll_decorators;
    var _findOne_decorators;
    var _update_decorators;
    var _remove_decorators;
    var _assignAgentToFolder_decorators;
    var _moveAgentsToFolder_decorators;
    var _getFolderStats_decorators;
    var FoldersController = _classThis = /** @class */ (function () {
        function FoldersController_1(foldersService) {
            this.foldersService = (__runInitializers(this, _instanceExtraInitializers), foldersService);
        }
        FoldersController_1.prototype.create = function (createFolderDto, req) {
            return this.foldersService.create(createFolderDto, req.user.accountId);
        };
        FoldersController_1.prototype.findAll = function (req) {
            return this.foldersService.findAll(req.user.accountId);
        };
        FoldersController_1.prototype.findOne = function (id, req) {
            return this.foldersService.findOne(id, req.user.accountId);
        };
        FoldersController_1.prototype.update = function (id, updateFolderDto, req) {
            return this.foldersService.update(id, updateFolderDto, req.user.accountId);
        };
        FoldersController_1.prototype.remove = function (id, req) {
            return this.foldersService.remove(id, req.user.accountId);
        };
        FoldersController_1.prototype.assignAgentToFolder = function (agentId, body, req) {
            return this.foldersService.assignAgentToFolder(agentId, body.folderId, req.user.accountId);
        };
        FoldersController_1.prototype.moveAgentsToFolder = function (body, req) {
            return this.foldersService.moveAgentsToFolder(body.agentIds, body.folderId, req.user.accountId);
        };
        FoldersController_1.prototype.getFolderStats = function (req) {
            return this.foldersService.getFolderStats(req.user.accountId);
        };
        return FoldersController_1;
    }());
    __setFunctionName(_classThis, "FoldersController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _create_decorators = [(0, common_1.Post)(), (0, common_1.HttpCode)(common_1.HttpStatus.CREATED)];
        _findAll_decorators = [(0, common_1.Get)()];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _update_decorators = [(0, common_1.Patch)(':id')];
        _remove_decorators = [(0, common_1.Delete)(':id'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _assignAgentToFolder_decorators = [(0, common_1.Patch)('assign-agent/:agentId'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _moveAgentsToFolder_decorators = [(0, common_1.Patch)('move-agents'), (0, common_1.HttpCode)(common_1.HttpStatus.OK)];
        _getFolderStats_decorators = [(0, common_1.Get)('stats/overview')];
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _assignAgentToFolder_decorators, { kind: "method", name: "assignAgentToFolder", static: false, private: false, access: { has: function (obj) { return "assignAgentToFolder" in obj; }, get: function (obj) { return obj.assignAgentToFolder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _moveAgentsToFolder_decorators, { kind: "method", name: "moveAgentsToFolder", static: false, private: false, access: { has: function (obj) { return "moveAgentsToFolder" in obj; }, get: function (obj) { return obj.moveAgentsToFolder; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getFolderStats_decorators, { kind: "method", name: "getFolderStats", static: false, private: false, access: { has: function (obj) { return "getFolderStats" in obj; }, get: function (obj) { return obj.getFolderStats; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FoldersController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FoldersController = _classThis;
}();
exports.FoldersController = FoldersController;
