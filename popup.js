document.addEventListener('DOMContentLoaded', function () {
	document.body.style.margin = '0';
	document.body.style.overflow = 'hidden';
	document.body.style.width = '750px';
	document.body.style.height = '380px'; 

	// SVG Trash Icon HTML
	const trashIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="14" height="14" fill="#ff4d4d"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>`;

	// DOM Elements
	const timerContainer = document.querySelector('.timer-container');
	const taskManager = document.querySelector('.task-manager');
	const progressIndicator = document.querySelector('.progress-indicator');
	const currentTaskElement = document.getElementById('currentTask');
	const timerValueElement = document.getElementById('timerValue');
	const taskListElement = document.getElementById('taskList');
	const newTaskInput = document.getElementById('newTaskInput');
	const taskTimeInput = document.getElementById('taskTimeInput');
	const menuButton = document.querySelector('.menu-button');
	const cancelButton = document.getElementById('cancelButton');
	const pauseButton = document.getElementById('pauseButton');
	const addTaskButton = document.getElementById('addTaskButton');
	const clearAllButton = document.getElementById('clearAllButton');
	const backToTimerButton = document.getElementById('backToTimerButton');
	const chimeSound = document.getElementById('chimeSound');

	let tasks = [];
	let currentTaskIndex = -1;
	let timerRunning = false;
	let timerPaused = false;
	let startTime = 0;
	let pausedTimeRemaining = 0;
	let originalDuration = 0;
	let timerInterval = null;
	let timerCompleted = false;

	const doItAgainLink = document.createElement('a');
	doItAgainLink.id = 'doItAgain';
	doItAgainLink.textContent = 'Do It Again?';
	doItAgainLink.className = 'do-it-again-link hidden';
	doItAgainLink.href = '#';
	doItAgainLink.style.marginLeft = '10px';
	doItAgainLink.style.color = '#3c8c3c';
	doItAgainLink.style.textDecoration = 'none';
	doItAgainLink.style.fontWeight = 'bold';

	pauseButton.parentNode.insertBefore(doItAgainLink, pauseButton.nextSibling);

	doItAgainLink.addEventListener('click', function (e) {
		e.preventDefault();
		if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
			startTimer();
			doItAgainLink.classList.add('hidden');
		}
	});

	function loadTasks() {
		chrome.storage.local.get(['pomodorTasks', 'currentTaskIndex'], function (result) {
			tasks = result.pomodorTasks || [];
			currentTaskIndex = result.currentTaskIndex !== undefined ? result.currentTaskIndex : -1;
			renderTaskList();

			if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
				setCurrentTask(currentTaskIndex);
			} else {
				currentTaskElement.textContent = "Create a task to get started...";
				setTimerDisplay(0);
				updateProgressBar(0);
			}
		});
	}

	function saveTasks() {
		chrome.storage.local.set({
			'pomodorTasks': tasks,
			'currentTaskIndex': currentTaskIndex
		});
	}

	function updateButtonLabels(isPaused) {
		if (isPaused) {
			pauseButton.textContent = 'Resume';
		} else {
			pauseButton.textContent = 'Pause';
		}
		cancelButton.textContent = 'Cancel'; 
	}

	// Render task list
	function renderTaskList() {
		taskListElement.innerHTML = '';

		tasks.forEach((task, index) => {
			const taskItem = document.createElement('div');
			taskItem.className = 'task-item';
			if (currentTaskIndex === index) {
				taskItem.classList.add('active-task');
			}

			const taskText = document.createElement('div');
			taskText.className = 'task-text';
			taskText.textContent = task.name;

			const taskTime = document.createElement('div');
			taskTime.className = 'task-time';
			taskTime.textContent = `${task.duration}m`;

			const taskDelete = document.createElement('div');
			taskDelete.className = 'task-delete';
			taskDelete.innerHTML = trashIconSvg; 
			taskDelete.addEventListener('click', (e) => {
				e.stopPropagation();
				deleteTask(index);
			});

			taskItem.appendChild(taskText);
			taskItem.appendChild(taskTime);
			taskItem.appendChild(taskDelete);

			taskItem.addEventListener('click', () => {
				setCurrentTask(index);
				showTimer();

				if (!timerRunning && !timerPaused) {
					startTimer();
				}
			});

			taskListElement.appendChild(taskItem);
		});
	}

	function addTask() {
		const taskName = newTaskInput.value.trim();
		const taskDuration = parseInt(taskTimeInput.value);

		if (taskName && taskDuration > 0) {
			tasks.push({
				name: taskName,
				duration: taskDuration
			});

			if (tasks.length === 1) {
				setCurrentTask(0);
				pauseButton.disabled = false; // Re-enable the button when first task is added
			}

			newTaskInput.value = '';
			taskTimeInput.value = '25';

			saveTasks();
			renderTaskList();
		}
	}

	// Delete task
	function deleteTask(index) {
		tasks.splice(index, 1);

		if (currentTaskIndex === index) {
			currentTaskIndex = tasks.length > 0 ? 0 : -1;
			if (currentTaskIndex >= 0) {
				setCurrentTask(currentTaskIndex);
			} else {
				resetTimer();
				currentTaskElement.textContent = "Create a task to get started...";
			}
		} else if (currentTaskIndex > index) {
			currentTaskIndex--;
		}

		saveTasks();
		renderTaskList();
	}

	// Clear all tasks
	function clearAllTasks() {
		tasks = [];
		currentTaskIndex = -1;
		resetTimer();
		currentTaskElement.textContent = "Create a task to get started...";
		saveTasks();
		renderTaskList();
		doItAgainLink.classList.add('hidden');
	}

	// Set current task
	function setCurrentTask(index) {
		if (index >= 0 && index < tasks.length) {
			currentTaskIndex = index;
			const task = tasks[index];

			currentTaskElement.textContent = task.name.length > 225
				? task.name.substring(0, 22) + '...'
				: task.name;

			resetTimer();
			setTimerDisplay(task.duration * 60);
			saveTasks();
			renderTaskList(); // Re-render to highlight active task

			doItAgainLink.classList.add('hidden');
			timerCompleted = false;
		}
	}

	function handleTimerComplete() {
		timerCompleted = true;
		doItAgainLink.classList.remove('hidden');

		if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
			setTimerDisplay(tasks[currentTaskIndex].duration * 60);
		}
	}

	function startTimer() {
		if (currentTaskIndex < 0) return;

		const task = tasks[currentTaskIndex];
		timerCompleted = false;
		doItAgainLink.classList.add('hidden');

		if (timerPaused) {
			originalDuration = pausedTimeRemaining;
			timerPaused = false;
		} else {
			originalDuration = task.duration * 60;
		}

		startTime = Date.now();
		timerRunning = true;
		updateButtonLabels(false); // Change to Pause
		document.body.classList.remove('timer-alert');

		updateProgressBar(0);

		timerInterval = setInterval(updateTimer, 1000);
	}

	function pauseTimer() {
		if (timerRunning) {
			clearInterval(timerInterval);
			timerRunning = false;
			timerPaused = true;
			updateButtonLabels(true); // Change to Resume

			const elapsed = Math.floor((Date.now() - startTime) / 1000);
			pausedTimeRemaining = originalDuration - elapsed;

			if (pausedTimeRemaining < 0) pausedTimeRemaining = 0;
		} else {
			startTimer();
		}
	}

	function resetTimer() {
		clearInterval(timerInterval);
		timerRunning = false;
		timerPaused = false;

		if (tasks.length > 0) {
			updateButtonLabels(false); // Reset to Pause
		} else {
			updateButtonLabels(true);
			pauseButton.disabled = true; // Optionally disable the button when no tasks
		}

		document.body.classList.remove('timer-alert');
		updateProgressBar(0);

		if (currentTaskIndex >= 0 && currentTaskIndex < tasks.length) {
			setTimerDisplay(tasks[currentTaskIndex].duration * 60);
		} else {
			setTimerDisplay(0);
		}

		doItAgainLink.classList.add('hidden');
		timerCompleted = false;
	}

	function updateTimer() {
		const elapsed = Math.floor((Date.now() - startTime) / 1000);
		const remaining = originalDuration - elapsed;

		if (remaining <= 0) {
			timerComplete();
			return;
		}

		setTimerDisplay(remaining);
		updateProgressBar(Math.floor((elapsed / originalDuration) * 100));
	}

	function timerComplete() {
		clearInterval(timerInterval);
		timerRunning = false;
		setTimerDisplay(0);
		updateProgressBar(100);

		chimeSound.play();

		document.body.classList.add('timer-alert');

		setTimeout(() => {
			handleTimerComplete();
		}, 3000);
	}

	function setTimerDisplay(seconds) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		timerValueElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function updateProgressBar(percentage) {
		progressIndicator.style.width = `${percentage}%`;
	}

	function showTaskManager() {
		timerContainer.classList.add('hidden');
		taskManager.classList.remove('hidden');
	}

	function showTimer() {
		taskManager.classList.add('hidden');
		timerContainer.classList.remove('hidden');
	}

	menuButton.addEventListener('click', function () {
		timerContainer.classList.add('hidden');
		taskManager.classList.remove('hidden');
	});

	backToTimerButton.addEventListener('click', function () {
		taskManager.classList.add('hidden');
		timerContainer.classList.remove('hidden');
	});

	cancelButton.addEventListener('click', function () {
		resetTimer();
	});

	pauseButton.addEventListener('click', pauseTimer);

	addTaskButton.addEventListener('click', addTask);
	clearAllButton.addEventListener('click', clearAllTasks);

	newTaskInput.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			addTask();
		}
	});

	// Initialize
	loadTasks();
	showTimer();
});