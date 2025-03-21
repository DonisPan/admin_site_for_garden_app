<script lang="ts">
  import { formatDate } from "$lib/formating";
  import type { User } from "../models/user.model";
  import type { Plant } from "../models/plant.model";
  import type { PlantClass } from "../models/class.model";
  import type { PlantFamily } from "../models/family.model";
    import { json } from "@sveltejs/kit";

  // Data from server load function
  export let data: { 
    users: User[], 
    userPlants: Plant[], 
    plants: Plant[], 
    classes: PlantClass[], 
    families: PlantFamily[] 
  };

  // We'll use a local copy of userPlants for editing/updating
  let plants: Plant[] = [...data.userPlants];

  let selectedUser: User | null = null;
  let selectedUserPlants: Plant[] = [];

  function handleUserClick(user: User) {
    selectedUser = user;
    selectedUserPlants = plants.filter((plant: Plant) => plant.user_id === user.id);
  }

  function handleDeleteUser(user: User, event: any) {
    event.stopPropagation();
    // Implement server call to delete user here
    alert(`Delete user: ${user.email}`);
  }

  // --- Editing state for plants ---
  let editingPlantId: number | null = null;
  let editingPlantName = "";
  // We'll store class and family as the selected ids
  let editingPlantClass: number = 0;
  let editingPlantFamily: number = 0;
  let editingPlantNote = "";

  let newPlantName: string = "";
  let newPlantClass: number = 0;
  let newPlantFamily: number = 0;
  let newPlantNote: string = "";

  // dropdowns data
  const classOptions = data.classes;
  const familyOptions = data.families;

  // delete
  async function deletePlant(id: number) {
    const formData = new FormData(); 
    formData.append('id', id.toString());

    const response = await fetch('/api/plants/delete', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Failed to delete plant');
      return;
    }

    // update local
    data.plants = data.plants.filter((plant: Plant) => plant.id !== id);
    if (selectedUser) {
      selectedUserPlants = plants.filter((plant: Plant) => plant.user_id === selectedUser!.id);
    }
  }

  // Update plant via POST method
  async function saveEditing() {
    if (editingPlantId !== null) {
      const updatedPlant = {
        id: editingPlantId,
        name: editingPlantName,
        class: editingPlantClass,
        family: editingPlantFamily,
        note: editingPlantNote
      };
      const response = await fetch('/api/plants/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlant)
      });
      if (!response.ok) {
        console.error('Failed to update plant');
        return;
      }
      // Update local state
      plants = plants.map((plant: Plant) =>
        plant.id === editingPlantId ? { ...plant, ...updatedPlant } : plant
      );
      if (selectedUser) {
        selectedUserPlants = plants.filter((plant: Plant) => plant.user_id === selectedUser!.id);
      }
      cancelEditing();
    }
  }

  function startEditing(plant: Plant) {
    editingPlantId = plant.id;
    editingPlantName = plant.name;
    const classMatch = classOptions.find((c) => c.id === plant.class);
    editingPlantClass = classMatch ? classMatch.id : 0;
    const familyMatch = familyOptions.find((f) => f.id === plant.family);
    editingPlantFamily = familyMatch ? familyMatch.id : 0;
    editingPlantNote = plant.note || "";
  }

  function cancelEditing() {
    editingPlantId = null;
    editingPlantName = "";
    editingPlantClass = 0;
    editingPlantFamily = 0;
    editingPlantNote = "";
  }

  // add plant
  async function addNewPlant() {
    if (newPlantName.trim() !== "") {
      const formData = new FormData();
      formData.append('name', newPlantName.trim());
      formData.append('note', newPlantNote.trim());
      formData.append('plantClass', newPlantClass.toString());
      formData.append('plantFamily', newPlantFamily.toString());

      const response = await fetch('/api/plants/add', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!responseData.success) {
        console.error('Failed to add plant');
        return;
      }

      const newPlant: Plant = {
        user_id: null,
        id: responseData.id as number,
        name: newPlantName,
        note: newPlantNote,
        class: newPlantClass,
        family: newPlantFamily,
        is_custom: false,
      }
      data.plants = [...data.plants, newPlant];
    }
  }

  // search
  let userSearchQuery: string = "";
  let plantSearchQuery: string = "";

  $: filteredUsers = data.users.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  $: filteredPlants = data.plants.filter((p: Plant) =>
    p.name.toLowerCase().includes(plantSearchQuery.toLowerCase())
  );
</script>

<div class="w-[100vw] flex flex-wrap gap-4 m-4">
  <!-- Left Column: Users and User Plants -->
  <div class="flex flex-col gap-4 w-[40vw]">
    <!-- Users Card -->
    <div class="bg-white border border-gray-300 rounded-lg p-4 h-[50vh] flex flex-col">
      <h2 class="text-lg font-semibold mb-2">Users</h2>
      <input
        type="text"
        placeholder="Search Users"
        bind:value={userSearchQuery}
        class="mb-2 border border-gray-300 rounded p-1"
      />
      <div class="flex-1 overflow-y-auto">
        <ul class="divide-y divide-gray-200">
          {#each filteredUsers as user (user.id)}
            <li
              class="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
              class:bg-blue-100={selectedUser && selectedUser.id === user.id}              
            >
            <button 
              on:click={() => handleUserClick(user)}
              >
              <div class="flex flex-col">
                <span class="font-bold">{user.name} {user.surname}</span>
                <span class="text-xs text-gray-500">Registered on: {formatDate(user.created_at)}</span>
              </div>
            </button>
            <button
              class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
              on:click|stopPropagation={(e) => handleDeleteUser(user, e)}
            >
              Delete
            </button>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- User Plants Card -->
    <div class="bg-white border border-gray-300 rounded-lg p-4 h-[45vh] flex flex-col">
      <h2 class="text-lg font-semibold mb-2">
        {#if selectedUser}
          {selectedUser.name}'s Plants
        {:else}
          User Plants
        {/if}
      </h2>
      <div class="flex-1 overflow-y-auto">
        <ul class="divide-y divide-gray-200">
          {#if selectedUser}
            {#if selectedUserPlants.length > 0}
              {#each selectedUserPlants as plant (plant.id)}
                <li class="py-2">
                  <span class="font-bold">{plant.name}</span>
                </li>
              {/each}
            {:else}
              <li class="py-2">No plants for this user.</li>
            {/if}
          {:else}
            <li class="py-2">Select a user to view their plants.</li>
          {/if}
        </ul>
      </div>
    </div>
  </div>

  <!-- Plants Column -->
  <div class="bg-white border border-gray-300 rounded-lg p-4 w-[45vw] h-[97vh] flex flex-col">
    <h2 class="text-lg font-semibold mb-2">Plants</h2>
    <input
      type="text"
      placeholder="Search My Plants"
      bind:value={plantSearchQuery}
      class="mb-2 border border-gray-300 rounded p-1"
    />
    <div class="flex-1 overflow-y-auto">
      <ul class="divide-y divide-gray-200">
        {#each filteredPlants as plant (plant.id)}
          <li class="py-2 flex items-center justify-between">
            {#if editingPlantId === plant.id}
              <div class="flex flex-col flex-1">
                <input
                  type="text"
                  bind:value={editingPlantName}
                  class="border border-gray-300 rounded p-1 mb-2"
                  placeholder="Plant Name"
                />
                <input
                  type="text"
                  bind:value={editingPlantNote}
                  class="border border-gray-300 rounded p-1 mb-2"
                  placeholder="Note"
                />
                <select bind:value={editingPlantClass} class="border border-gray-300 rounded p-1 mb-2">
                  {#each classOptions as option (option.id)}
                    <option value={option.id}>{option.name}</option>
                  {/each}
                </select>
                <select bind:value={editingPlantFamily} class="border border-gray-300 rounded p-1 mb-2">
                  {#each familyOptions as option (option.id)}
                    <option value={option.id}>{option.name_common} - {option.name_scientific}</option>
                  {/each}
                </select>
              </div>
              <div class="flex gap-2">
                <button
                  on:click={saveEditing}
                  class="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"> Save </button>
                <button
                  on:click={cancelEditing}
                  class="bg-gray-500 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"> Cancel </button>
              </div>
            {:else}
              <div class="flex flex-1 flex-col">
                <span class="font-bold">{plant.name}</span>
                <span class="text-sm">Note: <i class="font-semibold">{plant.note}</i></span>
                <span class="text-sm">
                  Class: <i class="font-semibold">
                    {data.classes.find(c => c.id === plant.class)?.name || "Unknown"}
                  </i>
                </span>
                <div>
                  <span class="text-sm">
                    Family Common: <i class="font-semibold">
                      {data.families.find(f => f.id === plant.family)?.name_common || "Unknown"}
                    </i> |
                  </span>
                  <span class="text-sm">
                    Family Scientific: <i class="font-semibold">
                      {data.families.find(f => f.id === plant.family)?.name_scientific || "Unknown"}
                    </i>
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  on:click={() => startEditing(plant)}
                  class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"> Edit </button>
                <button
                  on:click={() => deletePlant(plant.id)}
                  class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"> Delete </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <!-- New Plant Form -->
    <div class="mt-4 flex flex-col gap-2">
      <input
        type="text"
        placeholder="New Plant Name"
        bind:value={newPlantName}
        class="border border-gray-300 rounded p-1"
      />
      <input
        type="text"
        placeholder="Note"
        bind:value={newPlantNote}
        class="border border-gray-300 rounded p-1"
      />
      <select bind:value={newPlantClass} class="border border-gray-300 rounded p-1">
        <option value="" disabled selected>Select Class</option>
        {#each classOptions as option (option.id)}
          <option value={option.id}>{option.name}</option>
        {/each}
      </select>
      <select bind:value={newPlantFamily} class="border border-gray-300 rounded p-1">
        <option value="" disabled selected>Select Family</option>
        {#each familyOptions as option (option.id)}
          <option value={option.id}>{option.name_common} - {option.name_scientific}</option>
        {/each}
      </select>
      <button
        on:click={addNewPlant}
        class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
      > Add </button>
    </div>
  </div>

  <!-- Right buttons -->
  <div class="bg-white p-4 h-[97vh] w-[10vw] flex flex-col gap-2">
    <button
      on:click={addNewPlant}
      class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
    > Add class </button>

    <button
      on:click={addNewPlant}
      class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
    > Add family </button>

    <gap class="h-[20px]"></gap>
    <button
      on:click={addNewPlant}
      class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
    > Announcers </button>
  </div>
</div>
