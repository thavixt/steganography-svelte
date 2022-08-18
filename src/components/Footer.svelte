<script lang="ts">
	import Link from '../components/common/Link.svelte';
</script>

<footer class="px-6 py-8 pb-16 justify-self-end bg-red-500 text-white grid md:grid-cols-2 grid-cols-1 gap-x-12 gap-y-12">
	<div class="flex flex-col justify-center">
		<p class="mb-4">About me:</p>
		<ul>
			<li><Link icon to="https://github.com/thavixt">GitHub</Link></li>
			<li><Link icon to="https://komlosidev.net/">Personal site</Link></li>
		</ul>
	</div>
	<div class="flex flex-col justify-center">
		<p class="mb-4">About steganography:</p>
		<ul>
			<li>
				<Link icon to="https://en.wikipedia.org/wiki/Steganography">Steganography (Wikipedia)</Link>
			</li>
            <li>
                <small>
                    This small app was inspired by watching Computerphile's video -  
                    <Link icon to="https://www.youtube.com/watch?v=TWEXCYQKyDc">Secrets Hidden in Images</Link>
                </small>
            </li>
		</ul>
	</div>
</footer>
