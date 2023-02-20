<script lang="ts">
	import { createEventDispatcher } from "svelte";

    export let count = 0;

    const dispatch = createEventDispatcher<{ change: number }>();

    function increment() {
        count++;
        dispatch('change', count);
    }
    
    function decrement() {
        count--;
        dispatch('change', count);
    }
</script>

<slot {count}><p>The count is {count}</p></slot>
<button on:click={increment}>Increment</button>
<button on:click={decrement}>Decrement</button>
