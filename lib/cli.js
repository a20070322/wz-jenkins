'use strict';

var events = require('events');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var os = require('os');
var prompts = require('prompts');
var child_process = require('child_process');
var ora = require('ora');
var axios = require('axios');
var qs = require('qs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var prompts__default = /*#__PURE__*/_interopDefaultLegacy(prompts);
var child_process__default = /*#__PURE__*/_interopDefaultLegacy(child_process);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var qs__default = /*#__PURE__*/_interopDefaultLegacy(qs);

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function mri2 (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
	}

	return out;
}

const removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
const findAllBrackets = (v) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];
  const parse = (match) => {
    let variadic = false;
    let value = match[1];
    if (value.startsWith("...")) {
      value = value.slice(3);
      variadic = true;
    }
    return {
      required: match[0].startsWith("<"),
      value,
      variadic
    };
  };
  let angledMatch;
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
const getMriOptions = (options) => {
  const result = {alias: {}, boolean: []};
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
  }
  return result;
};
const findLongest = (arr) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
const padRight = (str, length) => {
  return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
const camelcase = (input) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
const setDotProp = (obj, keys, val) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;
  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
};
const setByType = (obj, transforms) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];
    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
const getFileName = (input) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : "";
};
const camelcaseOptionName = (name) => {
  return name.split(".").map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join(".");
};
class CACError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class Option {
  constructor(rawName, description, config) {
    this.rawName = rawName;
    this.description = description;
    this.config = Object.assign({}, config);
    rawName = rawName.replace(/\.\*/g, "");
    this.negated = false;
    this.names = removeBrackets(rawName).split(",").map((v) => {
      let name = v.trim().replace(/^-{1,2}/, "");
      if (name.startsWith("no-")) {
        this.negated = true;
        name = name.replace(/^no-/, "");
      }
      return camelcaseOptionName(name);
    }).sort((a, b) => a.length > b.length ? 1 : -1);
    this.name = this.names[this.names.length - 1];
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
}

const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;

class Command {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
  }
  usage(text) {
    this.usageText = text;
    return this;
  }
  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }
  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }
  example(example) {
    this.examples.push(example);
    return this;
  }
  option(rawName, description, config) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }
  alias(name) {
    this.aliasNames.push(name);
    return this;
  }
  action(callback) {
    this.commandAction = callback;
    return this;
  }
  isMatched(name) {
    return this.name === name || this.aliasNames.includes(name);
  }
  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }
  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }
  hasOption(name) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }
  outputHelp() {
    const {name, commands} = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
    sections.push({
      title: "Usage",
      body: `  $ ${name} ${this.usageText || this.rawName}`
    });
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    if (showCommands) {
      const longestCommandName = findLongest(commands.map((command) => command.rawName));
      sections.push({
        title: "Commands",
        body: commands.map((command) => {
          return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
        }).join("\n")
      });
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
      });
    }
    let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const {name} = this.cli;
    const {versionNumber} = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const {options, globalCommand} = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const {options: parsedOptions, globalCommand} = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}
class GlobalCommand extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
}

var __assign = Object.assign;
class CAC extends events.EventEmitter {
  constructor(name = "") {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage("<command> [options]");
  }
  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }
  command(rawName, description, config) {
    const command = new Command(rawName, description || "", config, this);
    command.globalCommand = this.globalCommand;
    this.commands.push(command);
    return command;
  }
  option(rawName, description, config) {
    this.globalCommand.option(rawName, description, config);
    return this;
  }
  help(callback) {
    this.globalCommand.option("-h, --help", "Display this message");
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }
  example(example) {
    this.globalCommand.example(example);
    return this;
  }
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({args, options}, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
      }
    }
    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }
    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp();
      run = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion();
      run = false;
      this.unsetMatchedCommand();
    }
    const parsedArgv = {args: this.args, options: this.options};
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, {_: []});
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const {args, options, matchedCommand: command} = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
}

const cac = (name = "") => new CAC(name);

var name = "wz-jenkins";
var version = "1.0.0";

/** 数据存贮目录 */
const workPath = path__default["default"].join(os__default["default"].homedir(), name);
/** 数据任务json存放 */
const projectPath = path__default["default"].join(workPath, "project.json");
/** 敏感信息存放 */
const privacyPath = path__default["default"].join(workPath, "privacyPath.json");
/** jenkins */
const jenkinsPath = path__default["default"].join("deploy", "jenkins.config.js");

/**
 * 当前文件是否在项目配置中
 * @returns bool
 */
const getProject = (path) => {
    const projects = JSON.parse(fs__default["default"].readFileSync(projectPath, { encoding: "utf8" }));
    const index = projects.findIndex((item) => item.path === path);
    if (index == -1) {
        throw new Error(`此目录下不存在项目工程 ${path}`);
    }
    return projects[index];
};
/** 加载Jenkins配置文件 */
const loadJenkinsConfig = async (filePath) => {
    /** 动态加载模块配置文件 */
    const moduleConfig = await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(filePath);
    let config = {};
    if (typeof moduleConfig.generateConfig === "function") {
        config = await moduleConfig.generateConfig();
    }
    return config;
};
/** 获取隐私信息 */
const getPrivacyJson = (key) => {
    return JSON.parse(fs__default["default"].readFileSync(privacyPath, { encoding: "utf8" }))[key];
};

/** 获取全部分支 */
const getAllBranch = (path) => {
    const result = child_process__default["default"].execSync(`cd ${path} && git br`);
    const branchs = result
        .toString()
        .split("\n")
        .map((item, index) => {
        const isCurrent = item.startsWith("*");
        return {
            branchName: `${item}`.replace(/^\s+/g, ""),
            value: item.replace(/^\*\s+/, ""),
            isCurrent: isCurrent,
            index: index,
        };
    })
        .filter((item) => item.branchName !== "");
    return branchs;
};
/** 获取当前分支 */
const getCurrentBranch = (path) => {
    const branchs = getAllBranch(path).filter((item) => item.isCurrent);
    return branchs?.[0];
};

/** 获取选中项目 */
const getCurrentJob = async (project) => {
    const { selectJobIndex } = await prompts__default["default"]([
        {
            type: "select",
            name: "selectJobIndex",
            message: `请选择使用的job`,
            choices: project?.jenkins?.jobs?.map((job, index) => ({
                value: index,
                title: job.aliasName || job.jobName,
            })),
        },
    ], {
        onCancel: () => {
            throw new Error("用户退出，程序终止");
        },
    });
    return project?.jenkins?.jobs?.[selectJobIndex];
};
/** 获取运行时参数 */
const getJobRunParam = async (jenkinsPrompts) => {
    let parameter = {};
    parameter = await prompts__default["default"](jenkinsPrompts
        .filter((item) => item.type === "choose")
        .map((item) => {
        const prompt = {
            type: "select",
            name: item?.name || "",
            message: `请选择${item?.name}`,
            choices: item?.value.map((item) => ({
                value: item,
                title: item,
            })),
        };
        return prompt;
    }), {
        onCancel: () => {
            throw new Error("程序终止");
        },
    });
    return parameter;
};
/** 自动填充 */
const getAutoValue = (name, path) => {
    /** 自动获取GIT当前分支 */
    if (name === "GIT_CURRENT_BRANCH") {
        return `origin/${getCurrentBranch(path)?.value || ""}`;
    }
    return "";
};

const logSymbols = {
	info: 'ℹ️',
	success: '✅',
	warning: '⚠️',
	error: '❌️',
};

/** logger 封装，因目前是node环境 所以暂不使用此方法 */
// const logger = (...args1) => {
//   return Function.prototype.bind.apply(console.log, [console.log, ...args1]);
// };
/** 获取堆栈信息 */
const getStackTrace = function () {
    const obj = { name: "", message: "" };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack || "";
};
/** 控制台输出封装 */
const Log = {
    /** info */
    info(...args) {
        console.log(chalk__default["default"].cyan(...args));
    },
    /** warn */
    warn(...args) {
        console.log(chalk__default["default"].yellow("Warn:"), chalk__default["default"].yellow(...args));
    },
    /** error */
    error(...args) {
        console.log(chalk__default["default"].red("Error:"), chalk__default["default"].red(...args));
        const stack = getStackTrace() || "";
        const matchResult = stack.match(/\(.*?\)/g) || [];
        const line = matchResult[1] || "";
        console.log(`${chalk__default["default"].gray("Error stack:")} ${chalk__default["default"].gray(line)}`);
    },
    /**
     * loadingPromise
     * @param msg 值
     * @param fn 异步函数
     * @returns
     */
    async loadingPromise(msg, fn, that, ...arg) {
        const spinner = ora__default["default"](chalk__default["default"].cyan(`Loading ${msg}`)).start();
        try {
            let result;
            if (!!that || !!arg) {
                result = await fn.apply(that, arg);
            }
            else {
                result = await fn();
            }
            spinner.stopAndPersist({
                prefixText: logSymbols.success,
                text: chalk__default["default"].green(`Success ${msg}`),
            });
            return result;
        }
        catch (error) {
            spinner.color = "red";
            spinner.stopAndPersist({
                prefixText: logSymbols.error,
                text: chalk__default["default"].red(`Error ${msg}`),
            });
            throw error;
        }
    },
};

/**
 * 创建jenkins axios 请求
 * @param options 配置
 * @returns
 */
const createJenkinsRequest = (options) => {
    const request = axios__default["default"].create({
        baseURL: options.host,
        auth: options.auth,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    request.interceptors.request.use(function (config) {
        if (config.method !== "get" && config.method !== "GET") {
            config.data = qs__default["default"].stringify(config.data || {});
        }
        return config;
    });
    return request;
};
/**
 * 构建项目
 * @param request axios实例
 * @param jobName 项目名称
 * @returns
 */
const buildJob = (request, jobName) => {
    return request({
        url: `/job/${jobName}/build/api/json`,
        method: "POST",
    });
};
/**
 * 构建带参数项目
 * @param request axios实例
 * @param jobName 项目名称
 * @param form 参数
 * @returns
 */
const buildParametersJob = (request, jobName, form) => {
    return request({
        url: `/job/${jobName}/buildWithParameters`,
        method: "POST",
        data: form,
    });
};
/**
 * 获取项目最后的结果
 * @param request axios实例
 * @param jobName 项目名称
 * @returns
 */
const getJobLastBuild = (request, jobName) => {
    return request({
        url: `/job/${jobName}/lastBuild/api/json`,
        method: "GET",
    });
};

/**
 * 是否为mac系统
 * @returns
 */
/**
 * 休眠函数
 * @param timer 定时器参数
 * @returns
 */
const sleep = (timer = 1000) => new Promise((resolve) => {
    setTimeout(() => resolve(), timer);
});

class JenkinsClient {
    /** jenkins 请求实例 */
    request;
    constructor(config) {
        /** 创建axios请求实例 */
        this.request = createJenkinsRequest(config);
    }
    /** 是否有执行中的任务 */
    async getJobLastBuild(jobName) {
        const { data } = await getJobLastBuild(this.request, jobName);
        return data;
    }
    /** 执行编译 */
    async buildJob(jobName, parameter = {}) {
        /**判断构建是否有参数 */
        if (Object.keys(parameter).length > 0) {
            await buildParametersJob(this.request, jobName, parameter);
        }
        else {
            await buildJob(this.request, jobName);
        }
        return true;
    }
    /** 等待任务是进入队列 */
    async waitJobJoinStatus(jobName, id) {
        const { data } = await getJobLastBuild(this.request, jobName);
        if (data.number !== id) {
            await sleep();
            return await this.waitJobJoinStatus(jobName, id);
        }
        return true;
    }
    /** 轮询获取最后一次任务状态 */
    async getLoopLastBuildStatus(jobName, id) {
        const { data } = await getJobLastBuild(this.request, jobName);
        if (data.building || data.number !== id) {
            await sleep();
            return await this.getLoopLastBuildStatus(jobName, id);
        }
        if (data.result !== "SUCCESS") {
            throw new Error(`任务执行失败---${data.result}`);
        }
        return true;
    }
}

/** 启动jenkins */
const startJenkinsJob = async () => {
    /** 当期工作目录 */
    const cwd = process.cwd();
    /** 获取项目 */
    const project = getProject(cwd);
    project.jenkins = await loadJenkinsConfig(path__default["default"].join(project.path, jenkinsPath));
    /** 获取用户选择的任务 */
    const currentJob = await getCurrentJob(project);
    if (typeof currentJob === "undefined") {
        throw new Error("未选择jenkins 运行任务");
    }
    /** 运行参数 */
    let runParam = {};
    /** 运行参数处理 */
    if (typeof currentJob.parameter !== "undefined") {
        const parameterTmp = currentJob.parameter;
        const jenkinsPrompts = Object.keys(parameterTmp).map((key) => parameterTmp[key]);
        runParam = await getJobRunParam(jenkinsPrompts);
        jenkinsPrompts
            .filter((item) => item.type === "auto")
            .forEach((item) => {
            runParam[item.name] = getAutoValue(item.value, project.path);
        });
        Log.info(`运行参数: ${JSON.stringify(runParam)}`);
    }
    if (project.jenkins.host === "") {
        throw new Error("未配置 Jenkins host");
    }
    const host = project.jenkins.host;
    /** 获取Jenkins配置 */
    const auth = getPrivacyJson(host);
    /** 实例化jenkins */
    const client = new JenkinsClient({
        host: host,
        auth: auth,
    });
    const lastBuild = await Log.loadingPromise(`检测[${currentJob.jobName}]是否正在执行任务`, client.getJobLastBuild, client, currentJob.jobName);
    /** 本次发布号 */
    const buildNumber = lastBuild.number + 1;
    if (lastBuild.building) {
        await Log.loadingPromise(`等待[${currentJob.jobName}]的上一个任务执行完毕`, client.getLoopLastBuildStatus, client, currentJob.jobName, lastBuild.number);
    }
    await Log.loadingPromise(`推送[${currentJob.jobName}]至队列`, client.buildJob, client, currentJob.jobName, runParam);
    await Log.loadingPromise(`推送[${currentJob.jobName}]至执行队列`, client.waitJobJoinStatus, client, currentJob.jobName, buildNumber);
    await Log.loadingPromise(`部署[${currentJob.jobName}]至服务器`, client.getLoopLastBuildStatus, client, currentJob.jobName, buildNumber);
    Log.info(`任务部署成功`);
};

/** 引导程序 初始化工作 */
const bootstrap = async () => {
    // 判断数据目录是否存在
    if (!fs__default["default"].existsSync(workPath)) {
        if (!fs__default["default"].existsSync(workPath)) {
            fs__default["default"].mkdirSync(workPath);
        }
    }
    if (!fs__default["default"].existsSync(projectPath)) {
        fs__default["default"].writeFileSync(projectPath, "[]", { encoding: "utf-8" });
    }
    if (!fs__default["default"].existsSync(privacyPath)) {
        fs__default["default"].writeFileSync(privacyPath, "{}", { encoding: "utf-8" });
    }
};

bootstrap();
const cli = cac(name);
/** cli命令数组 */
cli.commands = [
    /** 命令行 命令name , 命令描述 , 命令配置 */
    cli.command("", "执行jenkins脚本").action(startJenkinsJob),
];
/** cli-帮助 */
cli.help();
/** cli-版本*/
cli.version(version);
/** 解析命令行参数 */
cli.parse();
/** 异常处理函数 */
const onError = (err) => {
    console.log(chalk__default["default"].red("Error:"), chalk__default["default"].red(err.message));
    console.log(`${chalk__default["default"].gray("Stack:")} ${chalk__default["default"].gray(err.stack)}`);
    process.exit(1);
};
/** 监听 uncaughtException 异常 */
process.on("uncaughtException", onError);
/** 监听 unhandledRejection 异常 */
process.on("unhandledRejection", onError);
