$d = 'c:\Users\guy9d\Desktop\Trippy'

$lintOut = & npm --prefix $d run lint 2>&1
$lOk = ($LASTEXITCODE -eq 0)

$buildOut = & npm --prefix $d run build 2>&1
$bOk = ($LASTEXITCODE -eq 0)

$lStatus = if ($lOk) { 'OK' } else { 'FAIL' }
$bStatus = if ($bOk) { 'OK' } else { 'FAIL' }

if ($lOk -and $bOk) {
    Write-Output '{"systemMessage":"Pre-push checks PASSED — Lint: OK | Build: OK"}'
    exit 0
} else {
    $msg = "Pre-push checks FAILED — Lint: $lStatus | Build: $bStatus — fix before pushing!"
    Write-Output "{`"systemMessage`":`"$msg`"}"
    exit 2
}
