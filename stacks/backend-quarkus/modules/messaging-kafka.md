# Module — Messaging (Kafka + RabbitMQ via SmallRye)

Async pipelines on Quarkus: Kafka for high-throughput/replayable batch, RabbitMQ for fanout notifications. Same programming model (`@Channel`/`@Incoming`/`Emitter`) for both. Source: `_context-docs/backend-messaging-kafka-rabbitmq.html`. Reference flow: **HTTP → Kafka (slow batch) → bridge → RabbitMQ (fanout to 3 channels)**.

## When to pick
Decouple producers/consumers; absorb backpressure; fanout one event to N consumers; high-throughput batch that must not block the HTTP request. RabbitMQ = one-shot commands + per-message ack/retry. Kafka = replayable log + horizontal scale via partitions.

## Deps
```xml
<dependency><groupId>io.quarkus</groupId><artifactId>quarkus-messaging-kafka</artifactId></dependency>
<dependency><groupId>io.quarkus</groupId><artifactId>quarkus-messaging-rabbitmq</artifactId></dependency>
```
Local infra: `docker-compose.messaging.yml` (Zookeeper + Kafka :9092 + RabbitMQ :5672 / UI :15672 guest/guest). Disable Quarkus Dev Services (`quarkus.kafka.devservices.enabled=false`) to use the shared compose.

## Key patterns / gotchas (MUST honor)
- **`@Blocking` on blocking consumers.** An `@Incoming` handler that blocks (`Thread.sleep`, JDBC, blocking HTTP) freezes the Kafka poll loop → SmallRye closes the channel. `@Blocking` moves it to a worker thread.
- **RabbitMQ consumers receive `JsonObject`, not your POJO** (AMQP has no typed-deserializer concept) → `json.mapTo(Pojo.class)`. A `TodoEvent event` signature throws `ClassCastException`.
- **Kafka uses a typed `value.deserializer`** → subclass `JsonbDeserializer<T>` with a **no-arg ctor** that fixes the target type (`super(TodoBatchMessage.class)`). Producer needs no subclass (`JsonbSerializer` is generic).
- **Register the batch in stats BEFORE sending** messages, so an immediate `GET /status/{batchId}` doesn't 404.
- **Fanout exchange** copies to all bound queues (ignores routing key); each channel = its own queue/handler/retry/DLQ. Add a channel = new queue + consumer + 3 properties lines; the producer never changes.
- **`done` rule:** `enqueued>0 && inProgress==0 && (processed+failed)>=enqueued`.

## Properties sketch
```properties
kafka.bootstrap.servers=${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
mp.messaging.outgoing.todos-batch-out.connector=smallrye-kafka
mp.messaging.outgoing.todos-batch-out.topic=todos.batch
mp.messaging.outgoing.todos-batch-out.value.serializer=io.quarkus.kafka.client.serialization.JsonbSerializer
mp.messaging.incoming.todos-batch-in.connector=smallrye-kafka
mp.messaging.incoming.todos-batch-in.topic=todos.batch
mp.messaging.incoming.todos-batch-in.group.id=hello-world-batch
mp.messaging.incoming.todos-batch-in.auto.offset.reset=earliest
mp.messaging.incoming.todos-batch-in.value.deserializer=<pkg>.TodoBatchMessageDeserializer
# RabbitMQ fanout
mp.messaging.outgoing.todo-created-out.connector=smallrye-rabbitmq
mp.messaging.outgoing.todo-created-out.exchange.name=todo.created
mp.messaging.outgoing.todo-created-out.exchange.type=fanout
mp.messaging.incoming.email-notifications-in.connector=smallrye-rabbitmq
mp.messaging.incoming.email-notifications-in.queue.name=todo.notifications.email
mp.messaging.incoming.email-notifications-in.exchange.name=todo.created
mp.messaging.incoming.email-notifications-in.exchange.type=fanout
# (sms / push identical)
```

## Verification gate (`%test` → in-memory, no brokers)
```properties
%test.mp.messaging.outgoing.todos-batch-out.connector=smallrye-in-memory
%test.mp.messaging.incoming.todos-batch-in.connector=smallrye-in-memory
%test.mp.messaging.outgoing.todo-created-out.connector=smallrye-in-memory
%test.mp.messaging.incoming.email-notifications-in.connector=smallrye-in-memory
# (sms / push identical)
```
Assert producer → consumer → stats without Kafka/Rabbit running. Same `@Channel`/`@Incoming` names; only the connector swaps.
