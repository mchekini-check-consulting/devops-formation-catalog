{{- define "catalogue.labels" -}}
app: {{ .Chart.Name }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "catalogue.selectorLabels" -}}
app: {{ .Chart.Name }}
{{- end }}
