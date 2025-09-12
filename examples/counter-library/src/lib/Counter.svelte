<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		count?: number;
		children?: Snippet<[any]>;
		onchange?: (count: number) => void;
	}

	let { count = 0, children, onchange }: Props = $props();

	function increment() {
		count++;
		onchange?.(count);
	}

	function decrement() {
		count--;
		onchange?.(count);
	}
</script>

{#if children}
	{@render children({ count })}
{:else}
	<p>The count is {count}</p>
{/if}

<button onclick={increment}>Increment</button>
<button onclick={decrement}>Decrement</button>
