<script lang="ts">
  import { formatDate } from "$lib/formating";
  import type { User } from "../models/user.model";
  import type { Plant } from "../models/plant.model";
  import type { PlantClass } from "../models/class.model";
  import type { PlantFamily } from "../models/family.model";
  import type { Announcer } from "../models/announcer.model";

  export let data: { 
    users: User[], 
    userPlants: Plant[], 
    plants: Plant[], 
    classes: PlantClass[], 
    families: PlantFamily[],
    announcers: Announcer[],
  };

  // search
  let userSearchQuery: string = '';
  let plantSearchQuery: string = '';

  // select user
  let selectedUser: User | null = null;
  let selectedUserPlants: Plant[] = [];

  function handleUserClick(user: User) {
    selectedUser = user;
    selectedUserPlants = data.userPlants.filter((plant: Plant) => plant.user_id === user.id);
  }

  // delete user
  async function deleteUser(user: User) {
    const formData = new FormData(); 
    formData.append('id', user.id.toString());

    const confirmDelete = window.confirm('Si si istý, že chceš zmazať tohoto používateľa?');
    if (!confirmDelete) {
        return;
    }

    const response = await fetch('/api/users/delete', {
      method: 'POST',
      body: formData,
    });
    
    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Nepodarilo sa vymazať používateľa');
      return;
    }
    
    // update local
    filteredUsers = filteredUsers.filter((deletedUser: User) => deletedUser.id !== user.id);
    if(selectedUser?.id === user.id) {
      selectedUser = null;
    }

  }

  // delete plant
  async function deletePlant(id: number) {
    const formData = new FormData(); 
    formData.append('id', id.toString());

    const response = await fetch('/api/plants/delete', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Nepodarilo sa vymazať rastlinu');
      return;
    }

    // update local
    data.plants = data.plants.filter((plant: Plant) => plant.id !== id);
    if (selectedUser) {
      selectedUserPlants = data.userPlants.filter((plant: Plant) => plant.user_id === selectedUser!.id);
    }
  }

  // edit plant
  let editingPlantId: number | null = null;
  let editingPlantName: string = '';
  let editingPlantClass: number | null = null;
  let editingPlantFamily: number | null = null;
  let editingPlantNote: string = '';


  function startEditing(plant: Plant) {
    editingPlantId = plant.id;
    editingPlantName = plant.name;
    editingPlantClass = plant.class;
    editingPlantFamily = plant.family;
    editingPlantNote = plant.note || '';
  }

  function cancelEditing() {
    editingPlantId = null;
    editingPlantName = '';
    editingPlantClass = null;
    editingPlantFamily = null;
    editingPlantNote = '';
  }

  async function saveEditing() {
    if (editingPlantId !== null) {
      const formData = new FormData();
      formData.append('id', editingPlantId.toString());
      formData.append('name', editingPlantName);
      formData.append('note', editingPlantNote);
      formData.append('plantClass', editingPlantClass!.toString());
      formData.append('plantFamily', editingPlantFamily!.toString());

      const response = await fetch('/api/plants/update', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!responseData.success) {
        console.error('Nepodarilo sa upraviť rastlinu');
        return;
      }
      console.log(responseData.message);

      // update local
      data.plants = data.plants.map((plant: Plant) =>
        plant.id === editingPlantId
          ? { 
              ...plant, 
              name: editingPlantName, 
              note: editingPlantNote, 
              class: editingPlantClass, 
              family: editingPlantFamily 
            }
          : plant
      );
      if (selectedUser) {
        selectedUserPlants = data.userPlants.filter((plant: Plant) => plant.user_id === selectedUser!.id);
      }
      cancelEditing();
    }
  }

  // add plant
  let newPlantName: string = '';
  let newPlantClass: number = 0;
  let newPlantFamily: number = 0;
  let newPlantNote: string = '';

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
        console.error('Nepodarilo sa pridať rastlinu');
        return;
      }

      // update local
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
      newPlantName = '';
      newPlantClass = 0;
      newPlantFamily = 0;
      newPlantNote = '';
    }
  }

  $: filteredUsers = data.users.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.surname?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  $: filteredPlants = data.plants.filter((p: Plant) =>
    p.name.toLowerCase().includes(plantSearchQuery.toLowerCase())
  );

  // classes modal
  let showClassModal = false;
  let newClassName: string = '';
  function openAddClass() { showClassModal = true; }
  function closeAddClass() { showClassModal = false; }

  async function addClass() {
    if (newClassName.trim() !== '') {
      const formData = new FormData();
      formData.append('name', newClassName.trim().toUpperCase());

      const response = await fetch('/api/classes/add', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!responseData.success) {
        console.error('Nepodarilo sa pridať triedu rastliny');
        return;
      }

      // update local
      const newClass: PlantClass = {
        id: responseData.id,
        name: newClassName.toUpperCase(),
      };
      data.classes = [...data.classes, newClass];
      newClassName = '';
    }
  }
  async function removeClass(id: number) {
    const formData = new FormData(); 
    formData.append('id', id.toString());

    const response = await fetch('/api/classes/delete', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Nepodarilo sa odstrániť triedu rastliny');
      return;
    }

    // update local
    data.classes = data.classes.filter((plantClass: PlantClass) => plantClass.id !== id);
  }

  // families modal
  let showFamilyModal = false;
  let newFamilyCommonName: string = '';
  let newFamilyScientificName: string = '';
  function openAddFamily() { showFamilyModal = true; }
  function closeAddFamily() { showFamilyModal = false; }
  
  async function addFamily() {
    if (newFamilyCommonName.trim() !== '' && newFamilyScientificName.trim() !== '') {
      const formData = new FormData();
      formData.append('name_common', newFamilyCommonName.trim().toUpperCase());
      formData.append('name_scientific', newFamilyScientificName.trim().toUpperCase());

      const response = await fetch('/api/families/add', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!responseData.success) {
        console.error('Nepodarilo sa pridať rodinu rastliny');
        return;
      }

      // update local
      const newFamily: PlantFamily = {
        id: responseData.id,
        name_common: newFamilyCommonName.toUpperCase(),
        name_scientific: newFamilyScientificName.toUpperCase(),
      };
      data.families = [...data.families, newFamily];
      newFamilyCommonName = '';
      newFamilyScientificName = '';
    }
  }
  async function removeFamily(id: number) {
    const formData = new FormData(); 
    formData.append('id', id.toString());

    const response = await fetch('/api/families/delete', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Nepodarilo sa odstrániť rodinu rastliny');
      return;
    }

    // update local
    data.families = data.families.filter((plantFamily: PlantFamily) => plantFamily.id !== id);
  }

  // announcers modal
  let showAnnouncersModal: boolean = false;
  let newAnnouncerPlantFamily: number = 0;
  let newAnnouncerMessage: string = '';
  function openAnnouncers() { showAnnouncersModal = true; }
  function closeAnnouncers() { showAnnouncersModal = false; }

  async function addAnnouncer() {
    if (newAnnouncerMessage.trim() !== '' && newAnnouncerPlantFamily !== 0) {
      const formData = new FormData();
      formData.append('family', newAnnouncerPlantFamily.toString());
      formData.append('message', newAnnouncerMessage.trim());

      const response = await fetch('/api/announcers/add', {
        method: 'POST',
        body: formData,
      });
      const responseData = await response.json();
      if (!responseData.success) {
        console.error('Nepodarilo sa pridať oznámenie');
        return;
      }

      // update local
      const newAnnouncer: Announcer = {
        id: responseData.id,
        family: newAnnouncerPlantFamily,
        message: newAnnouncerMessage,
      };
      data.announcers = [...data.announcers, newAnnouncer];
      newAnnouncerMessage = '';
      newAnnouncerPlantFamily = 0;
    }
  }

  async function removeAnnouncer(id: number) {
    const formData = new FormData(); 
    formData.append('id', id.toString());

    const response = await fetch('/api/announcers/delete', {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();
    if (!responseData.success) {
      console.error('Nepodarilo sa odstrániť oznámenie');
      return;
    }

    // update local
    data.announcers = data.announcers.filter((announcer: Announcer) => announcer.id !== id);
  }

  // logout
  async function logout() {
    const response = await fetch('/api/loginPage/logout', {
          method: 'POST',
          body: new URLSearchParams({ action: 'logout' }),
      });
    location.reload();
  }
</script>

<div class="w-[100vw] flex flex-wrap gap-4 m-4">
  <!-- users and user plants -->
  <div class="flex flex-col gap-4 w-[40vw]">
    <!-- users -->
    <div class="bg-white border border-gray-300 rounded-lg p-4 h-[50vh] flex flex-col">
      <h2 class="text-lg font-semibold mb-2">Users</h2>
      <input
        type="text"
        placeholder="Vyhľadávanie používateľov"
        bind:value={userSearchQuery}
        class="mb-2 border border-gray-300 rounded p-1"
      />
      <div class="flex-1 overflow-y-auto">
        <ul class="divide-y divide-gray-200">
          {#each filteredUsers as user (user.id)}
            <li class="py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                class:bg-blue-100={selectedUser && selectedUser.id === user.id}>
              <button on:click={() => handleUserClick(user)}>
                <div class="flex flex-col items-start text-left">
                  <span class="text-md font-bold">{user.name} {user.surname}</span>
                  <span class="text-xs text-gray-500">Registrovaný: {formatDate(user.created_at)}</span>
                </div>
              </button>
              <button class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                      on:click={() => deleteUser(user)}>
                Odstrániť
              </button>
            </li>
          {/each}
        </ul>
      </div>
      
    </div>

    <!-- user plants -->
    <div class="bg-white border border-gray-300 rounded-lg p-4 h-[45vh] flex flex-col">
      <h2 class="text-lg font-semibold mb-2">
        {#if selectedUser}
          Rastliny používateľa {selectedUser.name}
        {:else}
          Rastliny používateľa
        {/if}
      </h2>
      <div class="flex-1 overflow-y-auto">
        <ul class="divide-y divide-gray-200">
          {#if selectedUser}
            {#if selectedUserPlants.length > 0}
              {#each selectedUserPlants as plant (plant.id)}
                <li class="py-2">
                  {#if plant.is_custom}
                  <span class="font-bold text-blue-800">{plant.name}</span>
                  {:else}
                  <span class="font-bold">{plant.name}</span>
                  {/if}
                </li>
              {/each}
            {:else}
              <li class="py-2">Tento používateľ si neeviduje žiadne rastliny</li>
            {/if}
          {:else}
            <li class="py-2">Vyber používateľa</li>
          {/if}
        </ul>
      </div>
    </div>
  </div>

  <!-- plants -->
  <div class="bg-white border border-gray-300 rounded-lg p-4 w-[45vw] h-[97vh] flex flex-col">
    <h2 class="text-lg font-semibold mb-2">Rastliny</h2>
    <input
      type="text"
      placeholder="Vyhľadávanie rastlín"
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
                  placeholder="Názov rastliny"
                />
                <input
                  type="text"
                  bind:value={editingPlantNote}
                  class="border border-gray-300 rounded p-1 mb-2"
                  placeholder="Poznámka"
                />
                <select bind:value={editingPlantClass} class="border border-gray-300 rounded p-1 mb-2">
                  {#each data.classes as option (option.id)}
                    <option value={option.id}>{option.name}</option>
                  {/each}
                </select>
                <select bind:value={editingPlantFamily} class="border border-gray-300 rounded p-1 mb-2">
                  {#each data.families as option (option.id)}
                    <option value={option.id}>{option.name_common} - {option.name_scientific}</option>
                  {/each}
                </select>
              </div>
              <div class="flex gap-2">
                <button
                  on:click={saveEditing}
                  class="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"> Uložiť </button>
                <button
                  on:click={cancelEditing}
                  class="bg-gray-500 text-white text-xs px-2 py-1 rounded hover:bg-gray-600"> Zrušiť </button>
              </div>
            {:else}
              <div class="flex flex-1 flex-col">
                <span class="font-bold">{plant.name}</span>
                <span class="text-sm">Poznámka: <i class="font-semibold">{plant.note}</i></span>
                <span class="text-sm">
                  Trieda: <i class="font-semibold">
                    {data.classes.find(c => c.id === plant.class)?.name || "Unknown"}
                  </i>
                </span>
                <div>
                  <span class="text-sm">
                    Názov rodiny: <i class="font-semibold">
                      {data.families.find(f => f.id === plant.family)?.name_common || "Unknown"}
                    </i> |
                  </span>
                  <span class="text-sm">
                    Vedecký názov rodiny: <i class="font-semibold">
                      {data.families.find(f => f.id === plant.family)?.name_scientific || "Unknown"}
                    </i>
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  on:click={() => startEditing(plant)}
                  class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"> Upraviť </button>
                <button
                  on:click={() => deletePlant(plant.id)}
                  class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"> Odstrániť </button>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>

    <!-- new plant -->
    <div class="mt-4 flex flex-col gap-2">
      <input
        type="text"
        placeholder="Názov novej rastliny"
        bind:value={newPlantName}
        class="border border-gray-300 rounded p-1"
      />
      <input
        type="text"
        placeholder="Poznámka"
        bind:value={newPlantNote}
        class="border border-gray-300 rounded p-1"
      />
      <select bind:value={newPlantClass} class="border border-gray-300 rounded p-1">
        <option value=0 disabled selected>Vyber triedu</option>
        {#each data.classes as option (option.id)}
          <option value={option.id}>{option.name}</option>
        {/each}
      </select>
      <select bind:value={newPlantFamily} class="border border-gray-300 rounded p-1">
        <option value=0 disabled selected>Vyber rodinu</option>
        {#each data.families as option (option.id)}
          <option value={option.id}>{option.name_common} - {option.name_scientific}</option>
        {/each}
      </select>
      <button
        on:click={addNewPlant}
        class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
      > Pridať </button>
    </div>
  </div>

  <!-- right buttons -->
  <div class="bg-white p-4 h-[97vh] w-[10vw] flex flex-col gap-2">
    <button
      on:click={openAddClass}
      class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
    > Manažovanie tried </button>

    <button
      on:click={openAddFamily}
      class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
    > Manažovanie rodín </button>

    <gap class="h-[20px]"></gap>
    <button
      on:click={openAnnouncers}
      class="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
    > Oznámenia </button>

    <button
      on:click={logout}
      class="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
    > Odhlásiť </button>
  </div>

  <!-- class modal -->
  {#if showClassModal}
    <div class="fixed inset-0 flex items-center justify-center backdrop-blur-lg z-50 transition-opacity duration-300">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 transform transition-all duration-300 scale-95">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Triedy</h2>
          <button on:click={closeAddClass} class="text-gray-600 hover:text-gray-800 text-3xl leading-none">X</button>
        </div>
        <table class="min-w-full border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Názov</th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each data.classes as classItem (classItem.id)}
              <tr>
                <td class="px-4 py-2">
                  <span class="block text-gray-800">{classItem.name}</span>
                </td>
                <td class="px-4 py-2 flex justify-end">
                  <button on:click={() => removeClass(classItem.id)} class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32 self-end">
                    Odstrániť
                  </button>
                </td>
              </tr>
            {/each}
            <tr>
              <td class="px-4 py-2">
                <input type="text" bind:value={newClassName} class="w-full border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Nová trieda" />
              </td>
              <td class="px-4 py-2 flex justify-end">
                <button on:click={addClass} class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32">
                  Pridať
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- family modal -->
  {#if showFamilyModal}
    <div class="fixed inset-0 flex items-center justify-center backdrop-blur-lg z-50 transition-opacity duration-300">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 transform transition-all duration-300 scale-95 max-h-150 overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Rodiny</h2>
          <button on:click={closeAddFamily} class="text-gray-600 hover:text-gray-800 text-3xl leading-none">X</button>
        </div>
        <table class="min-w-full border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Názov</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Vedecký názov</th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each data.families as familyItem (familyItem.id)}
              <tr>
                <td class="px-4 py-2">
                  <span class="block text-gray-800">{familyItem.name_common}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="block text-gray-800">{familyItem.name_scientific}</span>
                </td>
                <td class="px-4 py-2 flex justify-end">
                  <button on:click={() => removeFamily(familyItem.id)} class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32 self-end">
                    Odstrániť
                  </button>
                </td>
              </tr>
            {/each}
            <tr>
              <td class="px-4 py-2">
                <input type="text" bind:value={newFamilyCommonName} class="w-full border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Nový názov" />
              </td>
              <td class="px-4 py-2">
                <input type="text" bind:value={newFamilyScientificName} class="w-full border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Nový vedecký názov" />
              </td>
              <td class="px-4 py-2 flex justify-end">
                <button on:click={addFamily} class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32">
                  Pridať
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- announcers modal -->
  {#if showAnnouncersModal}
    <div class="fixed inset-0 flex items-center justify-center backdrop-blur-lg z-50 transition-opacity duration-300">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 transform transition-all duration-300 scale-95 max-h-150 overflow-y-auto">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Správa oznámení</h2>
          <button on:click={closeAnnouncers} class="text-gray-600 hover:text-gray-800 text-3xl leading-none">X</button>
        </div>
        <table class="min-w-full border border-gray-200">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Rodina</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600">Oznam</th>
              <th class="px-4 py-2 text-right text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each data.announcers as announcer (announcer.id)}
              <tr>
                <td class="px-4 py-2">
                  <span class="block text-gray-800">{data.families.find(f => f.id === announcer.family)?.name_common || "Unknown"} | 
                    {data.families.find(f => f.id === announcer.family)?.name_scientific || "Unknown"}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="block text-gray-800">{announcer.message}</span>
                </td>
                <td class="px-4 py-2 flex justify-end">
                  <button on:click={() => removeAnnouncer(announcer.id)} class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32 self-end">
                    Odstrániť
                  </button>
                </td>
              </tr>
            {/each}
            <tr>
              <td class="px-4 py-2">
                <select bind:value={newAnnouncerPlantFamily} class="border border-gray-300 rounded p-1">
                  <option value=0 disabled selected>Vyber rodinu</option>
                  {#each data.families as option (option.id)}
                    <option value={option.id}>{option.name_common} - {option.name_scientific}</option>
                  {/each}
                </select>
              </td>
              <td class="px-4 py-2">
                <textarea bind:value={newAnnouncerMessage} class="w-full h-24 border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Nový oznam"></textarea>
              </td>
              <td class="px-4 py-2 flex justify-end">
                <button on:click={addAnnouncer} class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors duration-200 w-32">
                  Pridať
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
