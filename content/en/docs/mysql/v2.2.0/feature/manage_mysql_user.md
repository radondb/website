---
shortTitle: "User Management"
title: "User management with MysqlUser CRDs"
weight: 8
---

This tutorial demonstrates how to manage users with MysqlUser CRDs.

##  Prerequisites

* The [RadonDB MySQL cluster](../../installation/on_kubernetes) has been deployed.

## Create the user account

### Validate the CRD

Run the following command, and the `mysqlusers.mysql.radondb.com` CRD is displayed.

```plain
kubectl get crd | grep mysqluser
mysqlusers.mysql.radondb.com                          2021-09-21T09:15:08Z
```

### Create the Secret

RadonDB MySQL uses the [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) object in Kubernetes to save the user password.

Run the following command to create the `sample-user-password` Secret using the [sample configuration](#secret).

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysqluser_secret.yaml
```

### Create the user

Run the following command to create a user named `sample_user` using the [sample configuration](#mysqluser).

```plain
kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysql_v1alpha1_mysqluser.yaml 
```

> **Note:** Modifying `spec.user` (username) directly creates a new user with the username. To create multiple users, make sure that `metadata.name` (name of custom resource instance) matches `spec.user`.

## Configure the user account

The user account is defined by parameters in the `spec` field. Currently, you are allowed to modify the user account by the following operations:

* Modify the `hosts` parameter.
* Add the `permissions` parameter.

### Host IP addresses

The host IP addresses allowed to access can be configured by defining the `hosts` parameter:

* `%` indicates all host IP addresses are allowed to access.
* You are allowed to configure one or multiple IP addresses.

```plain
  hosts: 
    - "%"
```

### User rights

You are allowed to configure the permission to access the database for the user account by the `permissions` field. To add more user rights, you can add parameters under the `permissions` field.

```plain
permissions:
    - database: "*"
      tables:
        - "*"
      privileges:
        - SELECT
```

* The `database` parameter indicates the database that the user account is allowed to access. `*` indicates the user account is allowed to access all databases in the cluster.
* The `tables` parameter indicates the database tables that the user account is allowed to access. `*` indicates the user account is allowed to access all tables in the database.
* The `privileges` parameter indicates the database permissions granted for the user account. For more information, see [privileges supported by MySQL](https://dev.mysql.com/doc/refman/5.7/en/grant.html).

## Delete user account

Delete the `mysqluser` custom resource created with the [sample configuration](#mysqluser) as follows.

```plain
kubectl delete mysqluser sample-user-cr
```

>**Note:** Deleting the `mysqluser` custom resource automatically deletes the corresponding MySQL user.

## Sample configuration

### Secret

```plain
apiVersion: v1
kind: Secret
metadata:
  name: sample-user-password   # Secret name, applied to the secretSelector  
data:
  pwdForSample: UmFkb25EQkAxMjMKIA==  
  # secret key, applied to secretSelector.secretKey. The example password is base64-encoded RadonDB@123.
  # pwdForSample2:
  # pwdForSample3:
```

### MysqlUser

```plain
apiVersion: mysql.radondb.com/v1alpha1
kind: MysqlUser
metadata:
  name: sample-user-cr  # User CR name. It is recommended that you manage one user with one user CR.
spec:
  user: sample_user  # The name of the user to be created/updated
  hosts:            # Hosts can be accessed. You can specify multiple hosts. % represents all hosts.
       - "%"
  permissions:
    - database: "*"  # Database name. * indicates all databases. 
      tables:        # Table name. * indicates all tables
         - "*"
      privileges:     # Privileges. See https://dev.mysql.com/doc/refman/5.7/en/grant.html for more details.
         - SELECT
  
  userOwner:  # Specify the cluster where the user is located. It cannot be modified.
    clusterName: sample
    nameSpace: default # The namespace of the RadonDB MySQL cluster
  
  secretSelector:  # The secret key specifying the user and storing the user password
    secretName: sample-user-password  # Password name
    secretKey: pwdForSample  # The passwords of multiple users can be stored in a secret and distinguished by keys.
```