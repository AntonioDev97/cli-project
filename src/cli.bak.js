import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from "./main";

const parseArgumentsIntoOptions = (rawArgs)=>{
    const args = arg({
        '-generate': Boolean,
        
        '--yes': Boolean,
        '--install': Boolean,
        '-g': '-generate',
        '-y': '--yes',
        '-i': '--install',

        'project': Boolean,
        'crud': Boolean,
        'controller': Boolean,
        'model': Boolean,
        'p': 'project',
        'c': 'crud',
        'cntr' : 'controller',
        'm': 'model'

        
    },{
        argv: rawArgs.slice(2),
    });

    return {
        skipPrompts: args['--yes'] || false,
        template: args._[1],
        runInstall: args['--install'] || false,

        generate: args['-g'] || false,
        project: args['-p'] || false,
        crud: args['-c'] || false,
        component_name:args._[1],
        controller: args['-cntr'] || false,
        model: args['-m'] || false,

    };
};

const promptForMissingOptions = async(options)=>{
    
    
    const defaultTemplate = 'JavaScript';
    if(options.skipPrompts)
        return {
            ...options,
            template: options.template || defaultTemplate,
              
        };
    
    if(options.generate)
        return {
            ...options,
            
        }
    
    const questions = [];

    if(options.generate)
        questions.push({

        });

    if(!options.template){
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Please Choose which project templates to use',
            choices: ['JavaScript', 'TypeScript'],
            default: defaultTemplate
        });
    }
    
    if(!options.git){
        questions.push({
            type: 'Confirm',
            name: 'git',
            message: 'Initialize a git repository?',
            default: false
        });
    }

    const answers = await inquirer.prompt(questions);
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git
    };

};



export async function cli(args){
    let options = parseArgumentsIntoOptions(args);
    options = await promptForMissingOptions(options); 
    await createProject(options);
    console.log(options);
}

