<h1><i class="fa fa-road"></i> Glassfit Social Authentication</h1>
<hr />

<form>
	<div class="alert alert-warning">
		<p>
			Create a <strong>Glassfit Application</strong> via the
			<a href="https://auth.raceyourself.com/oauth/applications">Glassfit Developers Page</a> and then
			paste your application details here.
		</p>
		<br />
		<input type="text" data-field="social:glassfit:key" title="Consumer Key" class="form-control input-lg" placeholder="Consumer Key"><br />
		<input type="text" data-field="social:glassfit:secret" title="Consumer Secret" class="form-control input-md" placeholder="Consumer Secret">
	</div>
</form>

<button class="btn btn-lg btn-primary" id="save">Save</button>

<script>
	require(['forum/admin/settings'], function(Settings) {
		Settings.prepare();
	});
</script>
