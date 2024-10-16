/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	KnownActiveRevisionsMode,
	type ContainerAppsAPIClient,
	type Ingress,
} from "@azure/arm-appcontainers";
import { LocationListStep } from "@microsoft/vscode-azext-azureutils";
import {
	nonNullProp,
	nonNullValueAndProp,
} from "@microsoft/vscode-azext-utils";
import { type Progress } from "vscode";

import { containerAppsWebProvider } from "../../constants";
import { ContainerAppItem } from "../../tree/ContainerAppItem";
import { createContainerAppsAPIClient } from "../../utils/azureClients";
import { localize } from "../../utils/localize";
import { AzureWizardActivityOutputExecuteStep } from "../AzureWizardActivityOutputExecuteStep";
import { getContainerNameForImage } from "../image/imageSource/containerRegistry/getContainerNameForImage";
import { type ContainerAppCreateContext } from "./ContainerAppCreateContext";

export class ContainerAppCreateStep<
	T extends ContainerAppCreateContext,
> extends AzureWizardActivityOutputExecuteStep<T> {
	public priority: number = 620;
	public stepName: string = "containerAppCreateStep";
	protected getSuccessString = (context: T) =>
		localize(
			"createContainerAppSuccess",
			'Created container app "{0}"',
			context.newContainerAppName,
		);
	protected getFailString = (context: T) =>
		localize(
			"createContainerAppFail",
			'Failed to create container app "{0}"',
			context.newContainerAppName,
		);
	protected getTreeItemLabel = (context: T) =>
		localize(
			"createContainerAppLabel",
			'Create container app "{0}"',
			context.newContainerAppName,
		);

	public async execute(
		context: T,
		progress: Progress<{
			message?: string | undefined;
			increment?: number | undefined;
		}>,
	): Promise<void> {
		const appClient: ContainerAppsAPIClient =
			await createContainerAppsAPIClient(context);

		const resourceGroupName: string = nonNullValueAndProp(
			context.resourceGroup,
			"name",
		);
		const containerAppName: string = nonNullProp(
			context,
			"newContainerAppName",
		);

		const ingress: Ingress | undefined = context.enableIngress
			? {
					targetPort: context.targetPort,
					external: context.enableExternal,
					transport: "auto",
					allowInsecure: false,
					traffic: [
						{
							weight: 100,
							latestRevision: true,
						},
					],
				}
			: undefined;

		const creating: string = localize(
			"creatingContainerApp",
			"Creating container app...",
		);
		progress.report({ message: creating });

		context.containerApp = ContainerAppItem.CreateContainerAppModel(
			await appClient.containerApps.beginCreateOrUpdateAndWait(
				resourceGroupName,
				containerAppName,
				{
					location: (
						await LocationListStep.getLocation(
							context,
							containerAppsWebProvider,
						)
					).name,
					managedEnvironmentId: context.managedEnvironment?.id,
					configuration: {
						ingress,
						secrets: context.secrets,
						registries: context.registryCredentials,
						activeRevisionsMode: KnownActiveRevisionsMode.Single,
					},
					template: {
						containers: [
							{
								image: context.image,
								name: getContainerNameForImage(
									nonNullProp(context, "image"),
								),
								env: context.environmentVariables,
							},
						],
					},
				},
			),
		);
	}

	public shouldExecute(context: T): boolean {
		return !context.containerApp;
	}
}
