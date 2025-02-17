import { FileAccessor } from "../fileAccessor";
import { Definition, DefinitionLink, Location } from "vscode-languageserver";
import { DefinitionProvider } from "./definition";
import * as path from 'path';

export class IncludeDefinitionProvider implements DefinitionProvider {

    constructor(private fileAccessor: FileAccessor) {
    }

    public onDefinition = async (line: string, uri: string): Promise<Definition[]> => {
        let matches = /(.*)(!include([\S]*))([\s]*)*(.*)/.exec(line);
        if (!matches || matches.length !== 6) {
            return [];
        }
        let includeType = matches[2];
        let whatToInclude = `${matches[5]}`.trim();
        switch (includeType) {
            case "!include":
                let destination = this.fileAccessor.getRelativePathAsFileUri(uri, whatToInclude);
                return [Location.create(destination, {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                })];
            case "!include_dir_list":
            case "!include_dir_named":
            case "!include_dir_merge_list":
            case "!include_dir_merge_named":
                var files = this.fileAccessor.getFilesInFolderRelativeFromAsFileUri(whatToInclude, uri);
                files = files.filter(f => path.extname(f) === ".yaml");
                if (files.length === 0){
                    console.warn(`There were no files found in folder '${whatToInclude}' referenced with '${includeType}' from '${uri}'`);
                }
                return files.map(f => Location.create(f, {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                }));
            default:
                return [];
        }
    };
}
