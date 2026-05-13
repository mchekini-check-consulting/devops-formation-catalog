const { useAzureMonitor } = require('@azure/monitor-opentelemetry');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
const serviceName = process.env.SERVICE_NAME || 'catalog';

if (connectionString) {
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString,
    },
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    instrumentationOptions: {
      http: { enabled: true },
    },
  });
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    service: process.env.SERVICE_NAME || 'catalog',
    env: process.env.ENV || process.env.NODE_ENV || 'development',
    message: 'Azure Monitor OpenTelemetry initialized',
  }));
} else {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'WARN',
    service: process.env.SERVICE_NAME || 'catalog',
    env: process.env.ENV || process.env.NODE_ENV || 'development',
    message: 'APPLICATIONINSIGHTS_CONNECTION_STRING not set — tracing disabled',
  }));
}
