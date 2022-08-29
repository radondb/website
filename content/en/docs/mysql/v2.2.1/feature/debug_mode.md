---
title: "Debug mode"
weight: 7
---

## Enable the debug mode
To avoid the restart-on-fail loop of MySQL container in O&M, enable the debug mode by creating an empty file `/var/lib/mysql/sleep-forever` as follows.

```bash
kubectl exec -it sample-mysql-0 -c mysql -- sh -c 'touch /var/lib/mysql/sleep-forever'
```
As a result, MySQL containers in the `sample-mysql-0` pod will never restart when mysqld stops.

## Disable the debug mode

```bash
kubectl exec -it sample-mysql-0 -c mysql -- sh -c 'rm /var/lib/mysql/sleep-forever'
```

As a result, MySQL containers in the `sample-mysql-0` pod will restart after mysqld stops.