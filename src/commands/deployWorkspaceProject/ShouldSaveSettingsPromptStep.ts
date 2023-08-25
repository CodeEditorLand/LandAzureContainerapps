/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, nonNullProp } from "@microsoft/vscode-azext-utils";
import { localize } from "../../utils/localize";
import { IDeployWorkspaceProjectContext } from "./IDeployWorkspaceProjectContext";
import { IDeployWorkspaceProjectSettings, getContainerAppDeployWorkspaceSettings } from "./getContainerAppDeployWorkspaceSettings";

export class ShouldSaveSettingsPromptStep extends AzureWizardPromptStep<IDeployWorkspaceProjectContext> {
    public async prompt(context: IDeployWorkspaceProjectContext): Promise<void> {
        const settings: IDeployWorkspaceProjectSettings | undefined = await getContainerAppDeployWorkspaceSettings(nonNullProp(context, 'rootFolder'));

        if (context.registry && settings?.acrName === context.registry.name && context.containerApp && settings?.containerAppName === context.containerApp.name) {
            // No new changes to save
            return;
        }

        const saveItem = { title: localize('save', 'Save...') };
        const dontSaveItem = { title: localize('save', 'Don\'t Save...') };

        const userResponse = await context.ui.showWarningMessage(
            localize('saveWorkspaceSettings', 'New deployment settings detected. \nWould you like to save or overwrite your local project settings on successful deployment?'),
            { modal: true },
            saveItem,
            dontSaveItem
        );

        context.shouldSaveWorkspaceSettings = userResponse === saveItem;
    }

    public shouldPrompt(context: IDeployWorkspaceProjectContext): boolean {
        return context.shouldSaveWorkspaceSettings === undefined;
    }
}
