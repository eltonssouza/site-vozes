/**
 * Cadastro de Eventos - JavaScript
 * Vozes do Ipiranga
 */

(function($) {
    'use strict';

    $(document).ready(function() {

        // Toggle entre evento Gratuito e Pago
        $('input[name="eventType"]').on('change', function() {
            const eventType = $(this).val();
            const ticketPriceField = $('#ticketPriceField');
            const ticketPriceInput = $('#ticketPrice');

            if (eventType === 'pago') {
                ticketPriceField.slideDown(300);
                ticketPriceInput.prop('required', true);
            } else {
                ticketPriceField.slideUp(300);
                ticketPriceInput.prop('required', false);
                ticketPriceInput.val('');
            }
        });

        // Máscara para telefone
        $('#organizerPhone').on('input', function() {
            let phone = $(this).val().replace(/\D/g, '');

            if (phone.length <= 10) {
                phone = phone.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                phone = phone.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }

            $(this).val(phone);
        });

        // Máscara para valor do ingresso
        $('#ticketPrice').on('input', function() {
            let value = $(this).val().replace(/\D/g, '');

            if (value.length > 0) {
                value = (parseInt(value) / 100).toFixed(2);
                value = 'R$ ' + value.replace('.', ',');
            }

            $(this).val(value);
        });

        // Validação da data (não permitir datas passadas)
        const today = new Date().toISOString().split('T')[0];
        $('#eventDate').attr('min', today);

        // Preview da imagem
        $('#eventImage').on('change', function(e) {
            const file = e.target.files[0];

            if (file) {
                // Validar tamanho (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB');
                    $(this).val('');
                    return;
                }

                // Validar tipo
                if (!file.type.match('image/(jpeg|jpg|png)')) {
                    alert('Apenas imagens JPG, JPEG ou PNG são aceitas');
                    $(this).val('');
                    return;
                }
            }
        });

        // Validação do formulário antes do envio
        $('.signup-form').on('submit', function(e) {
            e.preventDefault();

            // Validar data
            const eventDate = new Date($('#eventDate').val());
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                alert('A data do evento não pode ser anterior à data atual');
                return false;
            }

            // Validar capacidade
            const capacity = $('#capacity').val();
            if (capacity && parseInt(capacity) < 1) {
                alert('A capacidade deve ser maior que zero');
                return false;
            }

            // Validar link de inscrição (se fornecido)
            const registrationLink = $('#registrationLink').val();
            if (registrationLink) {
                try {
                    new URL(registrationLink);
                } catch (_) {
                    alert('Por favor, insira um link válido para inscrição');
                    return false;
                }
            }

            // Se todas as validações passaram
            if (this.checkValidity()) {
                // Aqui você pode adicionar o código para enviar os dados
                // via AJAX para o backend

                alert('Evento cadastrado com sucesso!\n\nSeu evento será analisado e publicado em breve.');

                // Limpar o formulário
                this.reset();
                $('#ticketPriceField').hide();

                // Opcional: redirecionar para outra página
                // window.location.href = 'index.html';
            }

            return false;
        });

        // Auto-preencher cidade com São Paulo
        $('#eventCity').val('São Paulo');

        // Formatação do campo de duração
        $('#duration').attr('placeholder', 'Ex: 2 horas, 3 dias, 1 semana');

        // Tooltip para informações adicionais
        $('#additionalInfo').attr('placeholder', 'Inclua informações como: acessibilidade, estacionamento, dress code, etc.');

    });

})(jQuery);
