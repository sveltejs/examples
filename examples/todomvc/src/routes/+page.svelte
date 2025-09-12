<script lang="ts">
	import '../styles.css';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Todo } from './db.server';

	let { data } = $props();

	let inserting: Todo[] = $state([]);
	let deleting: Todo[] = $state([]);
	let updating: Todo[] = $state([]);

	const pending = (todo: Todo) => {
		const has = (list: Todo[], todo: Todo) => list.some((item) => item.id === todo.id);
		return has(inserting, todo) || has(deleting, todo) || has(updating, todo);
	};

	let todos = $derived(
		data.todos
			.filter((item) => !deleting.includes(item))
			.map((item) => updating.find((u) => u.id === item.id) ?? item)
			.concat(inserting)
	);

	let currentFilter = $derived(
		page.url.searchParams.has('active')
			? 'active'
			: page.url.searchParams.has('completed')
				? 'completed'
				: 'all'
	);

	let filtered = $derived(
		currentFilter === 'all'
			? todos
			: currentFilter === 'completed'
				? todos.filter((item) => item.completed)
				: todos.filter((item) => !item.completed)
	);

	let numActive = $derived(todos.filter((item) => !item.completed).length);

	let numCompleted = $derived(todos.filter((item) => item.completed).length);

	const addTodo: SubmitFunction = ({ formData, formElement }) => {
		const todo = {
			title: formData.get('title') as string,
			completed: false,
			id: 'temporary-' + Math.random()
		};
		formElement.reset();
		inserting.push(todo);

		return async ({ result, update }) => {
			if (result.type === 'success') {
				await update();
			}
			inserting = inserting.filter((item) => item.id !== todo.id);
		};
	};

	const toggleTodo: SubmitFunction = ({ formData }) => {
		const todo = data.todos.find((item) => item.id === formData.get('id'))!;
		const updated = { ...todo, completed: !todo.completed };
		updating.push(updated);

		return async ({ result, update }) => {
			if (result.type === 'success') {
				await update();
			}
			updating = updating.filter((item) => item.id !== updated.id);
		};
	};

	const editTodo: SubmitFunction = ({ formData }) => {
		const todo = data.todos.find((item) => item.id === formData.get('id'))!;
		const updated = { ...todo, title: formData.get('title') as string };
		updating.push(updated);

		return async ({ result, update }) => {
			if (result.type === 'success') {
				await update();
			}
			updating = updating.filter((item) => item.id !== updated.id);
		};
	};

	const deleteTodo: SubmitFunction = ({ formData }) => {
		const todo = data.todos.find((item) => item.id === formData.get('id'))!;
		deleting.push(todo);

		return async ({ result, update }) => {
			if (result.type === 'success') {
				await update();
			}
			deleting = deleting.filter((item) => item.id !== todo.id);
		};
	};
</script>

<svelte:head>
	<title>Todos</title>
	<meta name="description" content="A todo list app" />
</svelte:head>

<section class="todoapp">
	<header class="header">
		<h1>todos</h1>
		<form method="post" action="?/addTodo" use:enhance={addTodo}>
			<input
				name="title"
				class="new-todo"
				placeholder="What needs to be done?"
				autofocus
				required
			/>
		</form>
	</header>

	{#if todos.length > 0}
		<section class="main">
			<form method="post" action="?/toggleAll">
				<input type="hidden" name="completed" value={numCompleted === todos.length ? '' : 'true'} />
				<button
					id="toggle-all"
					class="toggle-all {numCompleted === todos.length ? 'checked' : ''}"
					aria-label="Mark all as {numCompleted === todos.length ? 'not done' : 'done'}"
				></button>
			</form>

			<ul class="todo-list">
				{#each filtered as todo (todo.id + (pending(todo) ? 'pending' : ''))}
					<li class={{ completed: todo.completed, pending: pending(todo) }}>
						<form action="?/toggleTodo" method="post" use:enhance={toggleTodo}>
							<input type="hidden" name="id" value={todo.id} />
							<input type="hidden" name="completed" value={todo.completed ? '' : 'true'} />
							<button
								class="toggle"
								disabled={pending(todo)}
								aria-label="Mark todo as {todo.completed ? 'not done' : 'done'}"
							></button>
						</form>

						<form class="text" action="?/editTodo" method="post" use:enhance={editTodo}>
							<input type="hidden" name="id" value={todo.id} />
							<input
								aria-label="Edit todo"
								type="text"
								name="title"
								class="edit"
								value={todo.title}
								readonly={todo.completed || pending(todo)}
								required
							/>
							<button class="save" aria-label="Save todo"></button>
						</form>

						<form action="?/deleteTodo" method="post" use:enhance={deleteTodo}>
							<input type="hidden" name="id" value={todo.id} />
							<button class="destroy" aria-label="Delete todo" disabled={pending(todo)}></button>
						</form>
					</li>
				{/each}
			</ul>

			<footer class="footer">
				<span class="todo-count">
					<strong>{numActive}</strong>
					{numActive === 1 ? 'item' : 'items'} left
				</span>

				<ul class="filters">
					<li><a class={{ selected: currentFilter === 'all' }} href="/">All</a></li>
					<li>
						<a class={{ selected: currentFilter === 'active' }} href="/?active">Active</a>
					</li>
					<li>
						<a class={{ selected: currentFilter === 'completed' }} href="/?completed">Completed</a>
					</li>
				</ul>

				{#if numCompleted}
					<form method="post" action="?/clearCompleted" use:enhance>
						<button class="clear-completed"> Clear completed </button>
					</form>
				{/if}
			</footer>
		</section>
	{/if}
</section>
