<script lang="ts">
import { goto } from "$app/navigation";
</script>

<main class="max-w-2xl mx-auto">
    <h1 class=" text-5xl  font-bold">Word Bibliography Guide</h1>
    <ol class="list-decimal">
        <li>Click "References"</li>
        <li>Click "Manage Sources"</li>
        <li>Click "Browse"</li>
        <li>Select "Sources.xml"</li>
        <li>Click "OK"</li>
    </ol>
    <a href="/" class="btn btn-success">Ok</a>
    <button class="btn btn-warning" onclick={()=>{
        localStorage.setItem("hideWordGuide", "true")
        goto("/")
    }}>Dont show this again</button>
</main>
