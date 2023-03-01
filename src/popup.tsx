import React, { createContext, ReactNode, useState } from 'react';

export type ClosePopupFunction<T = never> = (value: T) => void;
export type BuilderFunction<T = never> = (
	close: ClosePopupFunction<T>
) => ReactNode;

export type PopupAppendFunction = (
	component: ReactNode,
	resolver: () => void,
	id: string
) => void;
export type PopupRenderFunction = () => { component: ReactNode };

export interface PopupContextValue {
	append: PopupAppendFunction;
	layers: PopupLayer[];
	remove: (id: string) => void;
}

function empty(): any {
	throw new Error('PopupProvider not used');
}

export const PopupContext = createContext<PopupContextValue>({
	append: empty,
	remove: empty,
	layers: [],
});

export type OpenPopupFunction<T = never> = (
	builder: BuilderFunction<T>
) => Promise<null>;

export function openPopup<T>(
	context: PopupContextValue,
	builder: (close: (value: T) => void) => ReactNode,
	id: string
) {
	return new Promise<T | null>((resolve) => {
		function close(value: T) {
			context.remove(id);
			resolve(value);
		}

		const component = builder(close);
		const resolver = () => {
			context.remove(id);
			resolve(null);
		};

		context.append(component, resolver, id);
	});
}

export interface PopupLayer {
	component: ReactNode;
	resolver: () => void;
	name?: string;
	id: string;
}

export function PopupProvider(props: { children: ReactNode }) {
	const [layers, setLayers] = useState<PopupLayer[]>([]);

	const append: PopupAppendFunction = (component, resolver, id) =>
		setLayers((layers) => [...layers, { component, resolver, id }]);

	function remove(id: string) {
		setLayers((layers) => layers.filter((layer) => layer.id !== id));
	}

	return (
		<PopupContext.Provider value={{ layers, append, remove }}>
			{props.children}
		</PopupContext.Provider>
	);
}
