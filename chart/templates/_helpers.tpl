{{/*
Common labels
*/}}
{{- define "app.labels" -}}
app.kubernetes.io/name: {{ .Values.app.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "app.selectorLabels" -}}
app: {{ .Values.app.name }}
{{- end }}

{{/*
Full image path
*/}}
{{- define "app.image" -}}
{{ .Values.app.image.registry }}/{{ .Values.app.image.repository }}:{{ .Values.app.image.tag }}
{{- end }}


