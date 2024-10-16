/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { type IResourceGroupWizardContext } from "@microsoft/vscode-azext-azureutils";
import { type ExecuteActivityContext } from "@microsoft/vscode-azext-utils";

import { type CreateContainerAppTelemetryProps as TelemetryProps } from "../../telemetry/commandTelemetryProps";
import { type SetTelemetryProps } from "../../telemetry/SetTelemetryProps";
import { type IContainerAppContext } from "../IContainerAppContext";
import { type ImageSourceBaseContext } from "../image/imageSource/ImageSourceContext";
import { type IngressBaseContext } from "../ingress/IngressContext";

export interface ContainerAppCreateBaseContext
	extends IResourceGroupWizardContext,
		ImageSourceBaseContext,
		IngressBaseContext,
		IContainerAppContext,
		ExecuteActivityContext {
	newContainerAppName?: string;
}

export type ContainerAppCreateContext = ContainerAppCreateBaseContext &
	SetTelemetryProps<TelemetryProps>;
