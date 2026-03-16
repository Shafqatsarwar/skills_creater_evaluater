Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
$text = $args[0]
$output = $args[1]
$synth.SetOutputToWaveFile($output)
$synth.Speak($text)
$synth.Dispose()
