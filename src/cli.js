import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { processMain } from "./main";

const parseArgumentsIntoOptions = (rawArgs)=>{
    try{
        var args = arg({
            '--generate': Boolean,
            '-g': '--generate',

            '--module': Boolean,
            '--section': Boolean,
            '--endpoint': Boolean,
            '--controller': Boolean,
            '--model': Boolean,
            '-m': '--module',
            '-e': '--endpoint',
            '-c' : '--controller',
            '-o': '--model',
            '-s': '--section',

            '--yes': Boolean,
            '--install': Boolean,
            '-y': '--yes',
            '-i': '--install',        
        },{
            argv: rawArgs.slice(2),
        });
    } catch(error){
        console.error(`%s Invalid option ${error} \n Please we only have an option -g or --generate or use simple 'qatar' command`, chalk.red.bold('ERROR'));
        process.exit(1);
    }

    

    return {
        generate: args['--generate'] || false,
        component: args['--model'] ? 'model': false|| 
                   args['--endpoint'] ? 'endPoint': false || 
                   args['--controller'] ? 'controller': false || 
                   args['--module'] ? 'module': false || false,
        component_name:args._[0] || false,
        route: args._[1] || false,
        skipPrompts: args['--yes'] || false,
        runInstall: args['--install'] || false,
    };
};

const promptForMissingOptions = async(options) => {

    if(options.generate && options.component_name)
        return options;

    const questions = [];
    if(!options.generate)
        questions.push({
            type: 'list',
            name: 'qa_one',
            message: 'Please choose an option!',
            choices: ['generate'],
            default: 'generate'
        });
    
    if(!options.component){
        questions.push({
            type: 'list',
            name: 'component',
            message: 'Please choose one option',
            choices: ['module', 'endPoint','controller','model'],
        });
    }

    let answers = await inquirer.prompt(questions);
                
    options = {
        ...options,
        component: answers.component || options.component, 
    }

    const level2 = [];
    if(options.endPoint)
    level2.push({
        type: 'list',
        name: 'methods',
        message: 'Select the method end point',
        choices: ['GET','POST','PUT','DELETE','OPTIONS','HEAD']
    });

    if(!options.component_name)
    level2.push({
        type: 'input',
        name: 'name',
        message: `Please write name of ${options.component}`,
        validate: (input) => input.length > 2
    });

    answers = await inquirer.prompt(level2);

    options = {
        ...options,
        endPoint: options.endPoint ? answers.methods : options.endPoint || false,
        component_name: answers.name || options.component_name,
    };

    return options;
};

export const cli = async(args)=>{
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    console.log(options);
    new processMain(options);
};