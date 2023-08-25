/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.md in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ISubscriptionActionContext, nonNullValue } from "@microsoft/vscode-azext-utils";
import { ImageSource } from "../../../constants";
import { EnvironmentVariablesListStep } from "../../deployImage/imageSource/EnvironmentVariablesListStep";
import { AcrBuildSupportedOS } from "../../deployImage/imageSource/buildImageInAzure/OSPickStep";
import { IDeployWorkspaceProjectContext } from "../IDeployWorkspaceProjectContext";
import { getDefaultAzureContainerRegistry } from "./getDefaultAzureContainerRegistry";
import { getDefaultContainerAppsResources } from "./getDefaultContainerAppsResources";
import { getWorkspaceProjectPaths } from "./getWorkspaceProjectPaths";

export async function getDefaultContextValues(context: ISubscriptionActionContext): Promise<Partial<IDeployWorkspaceProjectContext>> {
    const { rootFolder, dockerfilePath } = await getWorkspaceProjectPaths();
    const resourceBaseName: string = nonNullValue(rootFolder.uri.path.split('/').at(-1));

    return {
        ...await getDefaultContainerAppsResources(context, rootFolder, resourceBaseName),
        ...await getDefaultAzureContainerRegistry(context, rootFolder, resourceBaseName),
        dockerfilePath,
        environmentVariables: await EnvironmentVariablesListStep.workspaceHasEnvFile() ? undefined : [],
        imageName: `${resourceBaseName}:latest`,
        imageSource: ImageSource.RemoteAcrBuild,
        os: AcrBuildSupportedOS.Linux,
        rootFolder,
    };
}
