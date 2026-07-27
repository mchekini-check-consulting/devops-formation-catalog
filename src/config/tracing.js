const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const serviceName = process.env.SERVICE_NAME || 'catalog';

// TracerProvider local, sans export vers un backend APM (Application
// Insights n'est plus disponible). Ça active :
// - un span par requête HTTP entrante (instrumentation du module http natif)
// - des traceId/spanId réels dans les logs (config/logger.js), pour corréler
//   les requêtes sans dépendre d'un service de tracing externe
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
});
provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  service: serviceName,
  env: process.env.ENV || process.env.NODE_ENV || 'development',
  message: 'OpenTelemetry tracing initialized (local, no export)',
}));
