$(document).ready(function() {
    // Alternar entre Pessoa Física e Jurídica
    $('input[name="personType"]').change(function() {
        const personType = $(this).val();
        const documentField = $('#document');
        const documentLabel = $('#documentLabel');
        const nameLabel = $('#nameLabel');
        const fantasyNameField = $('#fantasyNameField');

        if (personType === 'pf') {
            documentLabel.text('CPF');
            documentField.attr('placeholder', '000.000.000-00');
            nameLabel.text('Nome completo');
            fantasyNameField.hide().find('input').removeAttr('required');
        } else {
            documentLabel.text('CNPJ');
            documentField.attr('placeholder', '00.000.000/0000-00');
            nameLabel.text('Razão social');
            fantasyNameField.show().find('input').attr('required', true);
        }

        // Limpar campo do documento ao alterar tipo
        documentField.val('');
    });

    // Máscara para CPF/CNPJ
    $('#document').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        const personType = $('input[name="personType"]:checked').val();

        if (personType === 'pf') {
            // Máscara CPF: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // Máscara CNPJ: 00.000.000/0000-00
            value = value.replace(/(\d{2})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        }

        $(this).val(value);
    });

    // Máscara para telefone
    $('#phone').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
        value = value.replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
        $(this).val(value);
    });

    // Máscara para CEP
    $('#cep').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        $(this).val(value);
    });

    // Validação de CPF
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;

        return true;
    }

    // Validação de CNPJ
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');

        if (cnpj.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1))) return false;

        return true;
    }

    // Validação do documento ao sair do campo
    $('#document').on('blur', function() {
        const value = $(this).val();
        const personType = $('input[name="personType"]:checked').val();

        if (value) {
            let isValid = false;

            if (personType === 'pf') {
                isValid = validarCPF(value);
            } else {
                isValid = validarCNPJ(value);
            }

            if (!isValid) {
                $(this).addClass('is-invalid');
                if (!$(this).next('.invalid-feedback').length) {
                    $(this).after('<div class="invalid-feedback">' +
                        (personType === 'pf' ? 'CPF inválido' : 'CNPJ inválido') +
                        '</div>');
                }
            } else {
                $(this).removeClass('is-invalid');
                $(this).next('.invalid-feedback').remove();
            }
        }
    });

    // Validação de confirmação de senha
    $('#confirmPassword').on('blur', function() {
        const password = $('#password').val();
        const confirmPassword = $(this).val();

        if (confirmPassword && password !== confirmPassword) {
            $(this).addClass('is-invalid');
            if (!$(this).next('.invalid-feedback').length) {
                $(this).after('<div class="invalid-feedback">As senhas não coincidem</div>');
            }
        } else {
            $(this).removeClass('is-invalid');
            $(this).next('.invalid-feedback').remove();
        }
    });

    // Validação do formulário
    $('.signup-form').on('submit', function(e) {
        e.preventDefault();

        let isValid = true;
        const personType = $('input[name="personType"]:checked').val();

        // Validar documento
        const documentValue = $('#document').val();
        if (personType === 'pf' && !validarCPF(documentValue)) {
            $('#document').addClass('is-invalid');
            isValid = false;
        } else if (personType === 'pj' && !validarCNPJ(documentValue)) {
            $('#document').addClass('is-invalid');
            isValid = false;
        }

        // Validar confirmação de senha
        if ($('#password').val() !== $('#confirmPassword').val()) {
            $('#confirmPassword').addClass('is-invalid');
            isValid = false;
        }

        // Validar termos de uso
        if (!$('#acceptTerms').is(':checked')) {
            alert('Você deve aceitar os termos de uso para continuar.');
            isValid = false;
        }

        if (isValid) {
            alert('Cadastro realizado com sucesso!');
            // Aqui você pode fazer o submit real do formulário
            // this.submit();
        }
    });

    // Buscar CEP
    $('#cep').on('blur', function() {
        const cep = $(this).val().replace(/\D/g, '');

        if (cep.length === 8) {
            $.getJSON(`https://viacep.com.br/ws/${cep}/json/`, function(data) {
                if (!data.erro) {
                    $('#address').val(data.logradouro);
                    $('#neighborhood').val(data.bairro);
                    $('#city').val(data.localidade);
                    $('#state').val(data.uf);
                }
            }).fail(function() {
                console.log('Erro ao buscar CEP');
            });
        }
    });
});