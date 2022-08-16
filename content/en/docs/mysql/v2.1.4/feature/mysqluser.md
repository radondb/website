---
shortTitle: "User management with MysqlUser CRD"
title: "User management with MysqlUser CRD"
weight: 3
---
> This feature is supported in RadonDB MySQL Kubernetes 2.1.0 and later versions.

# Prerequisites

- The RadonDB MySQL cluster is deployed.

# Creating user account

## Step 1 Check CRD.

Run the following command, and the CRD named `mysqlusers.mysql.radondb.com` will be displayed.

```shell
$ kubectl get crd | grep mysqluser
mysqlusers.mysql.radondb.com                          2021-09-21T09:15:08Z
```

## Step 2 Create Secret.

RadonDB MySQL uses the [Secret](https://kubernetes.io/docs/concepts/configuration/secret/) object in Kubernetes to save user passwords.
Run the following command to create a Secret named sample-user-password using the sample configuration in this section.

```shell
$ kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysqluser_secret.yaml
```

## Step 3 Create user.

Run the following command to create a user named `sample_user` using the sample configuration.

```shell
$ kubectl apply -f https://raw.githubusercontent.com/radondb/radondb-mysql-kubernetes/main/config/samples/mysql_v1alpha1_mysqluser.yaml 
```

> Note: Modifying `spec.user` (username) directly creates a new user with the username. To create multiple users, make sure that `metadata.name` (CR instance name) corresponds to spec.user.

# Modifying user account

The user account is defined by the parameters in the `spec` field. Currently, the following operations are supported:
-	Modify the `hosts` parameter.
-	Add the `permissions` parameter.

## Authorizing IP address
You are allowed to authorize the IP address of the user account by defining the hosts parameter:
- % indicates all IP addresses are authorized.
- You can modify one or more IP addresses.

```shell
  hosts: 
    - "%"
```

## User privilege
You can define the database access permission for the user account with the `permissions` field in `mysqlUser`, and add user rights by adding parameters in the `permissions` field.

```plain
permissions:
    - database: "*"
      tables:
        - "*"
      privileges:
        - SELECT
```
- The database parameter indicates the database that the user account is allowed to access. **\*** indicates the user account is allowed to access all databases in the cluster.
-	The `tables` parameter indicates the database tables that the user account is allowed to access. * indicates the user account is allowed to access all tables in the database.
-	The `privileges` parameter indicates the database permissions granted for the user account. For more privilege descriptions, see [privileges supported by MySQL](https://dev.mysql.com/doc/refman/5.7/en/grant.html).


# Deleting user account
Delete the MysqlUser CR created with the sample configuration as follows.

```shell
$ kubectl delete mysqluser sample-user-cr
```

> Note: Deleting the MysqlUser CR automatically deletes the corresponding MySQL user.

# Sample configuration

## Secret

```shell
apiVersion: v1
kind: Secret
metadata:
  name: sample-user-password   # Secret name, applied to the secretSelector.secret  
data:
  pwdForSample: UmFkb25EQkAxMjMKIA==  # secret key, applied to secretSelector.secretKey. The example password is base64-encoded RadonDB@123.
  # pwdForSample2:
  # pwdForSample3:
```

## MysqlUser

```plain
apiVersion: mysql.radondb.com/v1alpha1
kind: MysqlUser
metadata:
 
  name: sample-user-cr  # User CR name. It is recommended that you manage one user with one user CR.
spec:
  user: sample_user  # The name of the user to be created/updated
  hosts:             # The hosts that can be accessed. You can specify multiple hosts. % represents all hosts.
       - "%"
  permissions:
    - database: "*"  # Database name. * indicates all databases.
      tables:        # Table name. * indicates all tables
         - "*"
      privileges:    # Permission. See https://dev.mysql.com/doc/refman/5.7/en/grant.html for more details.
         - SELECT
  
  userOwner:  # Specify the cluster where the user is located. It cannot be modified.
    clusterName: sample
    nameSpace: default # The namespace of the RadonDB MySQL cluster
  
  secretSelector:  # The secret key specifying the user and storing the user password
    secretName: sample-user-password  #password name. 
    secretKey: pwdForSample  # Key. The passwords of multiple users can be stored in a secret and distinguished by keys.
```