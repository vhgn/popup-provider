import React, { useContext, useState } from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { openPopup, PopupContext, PopupProvider } from './popup';

const log = jest.fn();

const justWait = (seconds: number) =>
	new Promise((resolve) => setTimeout(resolve, seconds));

function PopupOpener() {
	const context = useContext(PopupContext);
	const [counter, setCounter] = useState(0);

	async function handleClick() {
		const returnValue = counter;
		act(() => setCounter((count) => count + 1));

		const value = await openPopup<number>(
			context,
			(close) => {
				return (
					<button onClick={() => act(() => close(returnValue))}>
						Close with {returnValue}
					</button>
				);
			},
			counter.toString()
		);

		log(value);
	}

	return (
		<div>
			<button onClick={handleClick}>Open popup</button>
			{context.layers.map(({ component, resolver, id }) => (
				<div key={id}>
					<section>{component}</section>
					<button onClick={() => act(resolver)}>Close this</button>
				</div>
			))}
		</div>
	);
}

export default function PopupTester() {
	return (
		<PopupProvider>
			<PopupOpener />
		</PopupProvider>
	);
}

describe('PopupTester component', () => {
	it('should open a popup and close it with the provided value', async () => {
		const { getByText, queryByText } = render(
			<PopupProvider>
				<PopupTester />
			</PopupProvider>
		);

		fireEvent.click(getByText('Open popup'));

		expect(queryByText('Close with 0')).toBeInTheDocument();

		fireEvent.click(getByText('Close with 0'));

		expect(queryByText('Close with 0')).not.toBeInTheDocument();
	});

	it('should open several popups and close in reversed order', async () => {
		const { getByText, queryByText } = render(
			<PopupProvider>
				<PopupTester />
			</PopupProvider>
		);

		fireEvent.click(getByText('Open popup'));
		await screen.findByText('Close with 0');
		fireEvent.click(getByText('Open popup'));
		await screen.findByText('Close with 1');
		fireEvent.click(getByText('Open popup'));
		await screen.findByText('Close with 2');
		fireEvent.click(getByText('Open popup'));
		await screen.findByText('Close with 3');

		fireEvent.click(getByText('Close with 0'));
		await justWait(1);
		expect(queryByText('Close with 0')).not.toBeInTheDocument();
		expect(log).toBeCalledWith(0);

		fireEvent.click(getByText('Close with 1'));
		await justWait(1);
		expect(queryByText('Close with 1')).not.toBeInTheDocument();
		expect(log).toBeCalledWith(1);

		fireEvent.click(getByText('Close with 2'));
		await justWait(1);
		expect(queryByText('Close with 2')).not.toBeInTheDocument();
		expect(log).toBeCalledWith(2);

		fireEvent.click(getByText('Close with 3'));
		await justWait(1);
		expect(queryByText('Close with 3')).not.toBeInTheDocument();
		expect(log).toBeCalledWith(3);
	});
});
