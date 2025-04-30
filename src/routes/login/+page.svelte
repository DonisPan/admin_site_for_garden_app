<script lang="ts">
    import { goto } from '$app/navigation';
    
    let email = '';
    let password = '';
    let errorMessage = '';
  
    async function handleLogin(event: SubmitEvent) {
        event.preventDefault();
        errorMessage = '';

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('/api/loginPage/login', { method: 'POST', body: formData });
        const { success, error } = await response.json();
        if (!success) {
            errorMessage = error;
            return;
        }
        goto('/'); 
    }
  </script>
  
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Admin Login</h1>
      {#if errorMessage}
        <div class="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</div>
      {/if}
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="password">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
        >
          Log In
        </button>
      </form>
    </div>
  </div>
  