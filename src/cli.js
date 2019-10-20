import arg from 'arg';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { processMain } from "./main";

const parseArgumentsIntoOptions = (rawArgs)=>{
    try{
        var args = arg({
            '--generate': Boolean,
            '-g': '--generate',

            '--project': Boolean,
            '--endpoint': Boolean,
            '--controller': Boolean,
            '--model': Boolean,
            '-p': '--project',
            '-e': '--endpoint',
            '-c' : '--controller',
            '-m': '--model',

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

        project: args['--project'] || false,
        endPoint: args['--endpoint'] || false,
        controller: args['--controller'] || false,
        model: args['--model'] || false,
        component_name:args._[0] || false,
        route: args._[1] || false,

        skipPrompts: args['--yes'] || false,
        runInstall: args['--install'] || false,
    };
};

const promptForMissingOptions = async(options) => {

    if(!options.generate && options.component_name)
        return options;

    const questions = [];
    if(!options.generate)
        questions.push({
            type: 'checkbox',
            name: 'qa_one',
            message: 'Please choose an option!',
            choices: ['generate'],
            default: 'generate'
        });
    
    if(!options.project && !options.endPoint && !options.controller && !options.model){
        questions.push({
            type: 'list',
            name: 'component',
            message: 'Please choose one option',
            choices: ['project', 'endPoint','controller','model'],
        });
    }

    if(!options.component_name){
        questions.push({
            type: 'input',
            name: 'name',
            message: 'Please write name of component',
            validate: (input) => input.length > 2
        });
    }
    
    const answers = await inquirer.prompt(questions);
    
    options = {
        ...options,
        generate: answers.qa_one == 'generate' ? true : false || options.generate,
        project: answers.component == 'project' ? true : false || options.project,
        endPoint: answers.component =='endPoint' ? true : false || options.endPoint,
        controller: answers.component =='controller' ? true : false || options.controller,
        model: answers.component == 'model' ? true : false || options.model,
        component_name: answers.name || options.component_name,
    }

    return options;
};

export const cli = async(args)=>{
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options);
    console.log(options);
    new processMain(options);
};